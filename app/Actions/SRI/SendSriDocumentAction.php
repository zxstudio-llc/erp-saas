<?php

namespace App\Actions\SRI;

use App\Models\Invoice;
use App\Models\SriLog;

class SendSriDocumentAction
{
    public function execute(Invoice $invoice): void
    {
        $wsdl = $invoice->company->environment === 'prod'
            ? 'https://cel.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl'
            : 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl';

        try {
            $client = new \SoapClient($wsdl, [
                'trace' => 1,
                'exceptions' => true,
                'connection_timeout' => 30,
                'cache_wsdl' => WSDL_CACHE_NONE,
                'soap_version' => SOAP_1_1,
            ]);

            $response = $client->validarComprobante([
                'xml' => base64_encode($invoice->xml)
            ]);

            $status = 'sent';
            $errorMessage = null;

            if (isset($response->estado)) {
                if ($response->estado === 'RECIBIDA') {
                    $status = 'sent';
                } elseif ($response->estado === 'DEVUELTA') {
                    $status = 'rejected';
                    $errorMessage = $this->extractErrors($response);
                }
            }

            SriLog::create([
                'invoice_id' => $invoice->id,
                'action' => 'send',
                'request' => $invoice->xml,
                'response' => json_encode($response),
                'status' => $status,
                'error_message' => $errorMessage,
            ]);

            if ($status === 'rejected') {
                $invoice->update(['status' => 'rejected']);
                throw new \Exception('SRI rechazó el comprobante: ' . $errorMessage);
            }

            $invoice->update(['status' => 'sent']);

        } catch (\SoapFault $e) {
            SriLog::create([
                'invoice_id' => $invoice->id,
                'action' => 'send',
                'request' => $invoice->xml,
                'status' => 'error',
                'error_message' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    private function extractErrors($response): string
    {
        $errors = [];

        if (isset($response->comprobantes->comprobante->mensajes->mensaje)) {
            $mensajes = $response->comprobantes->comprobante->mensajes->mensaje;
            
            if (!is_array($mensajes)) {
                $mensajes = [$mensajes];
            }

            foreach ($mensajes as $mensaje) {
                $errors[] = sprintf(
                    '[%s] %s - %s',
                    $mensaje->identificador ?? 'N/A',
                    $mensaje->tipo ?? 'ERROR',
                    $mensaje->mensaje ?? 'Sin descripción'
                );
            }
        }

        return implode(' | ', $errors);
    }
}