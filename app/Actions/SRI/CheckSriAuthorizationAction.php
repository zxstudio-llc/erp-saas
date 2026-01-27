<?php

namespace App\Actions\SRI;

use App\Models\Invoice;
use App\Models\SriLog;

class CheckSriAuthorizationAction
{
    public function execute(Invoice $invoice): void
    {
        if ($invoice->status === 'authorized') {
            return;
        }

        $wsdl = $invoice->company->environment === 'prod'
            ? 'https://cel.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl'
            : 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl';

        try {
            $client = new \SoapClient($wsdl, [
                'trace' => 1,
                'exceptions' => true,
                'connection_timeout' => 30,
                'cache_wsdl' => WSDL_CACHE_NONE,
            ]);

            $response = $client->autorizacionComprobante([
                'claveAccesoComprobante' => $invoice->access_key
            ]);

            if (!isset($response->numeroComprobantes) || $response->numeroComprobantes == 0) {
                SriLog::create([
                    'invoice_id' => $invoice->id,
                    'action' => 'authorize',
                    'status' => 'pending',
                    'error_message' => 'Comprobante no encontrado en SRI',
                ]);
                return;
            }

            $autorizacion = is_array($response->autorizaciones->autorizacion)
                ? $response->autorizaciones->autorizacion[0]
                : $response->autorizaciones->autorizacion;

            $status = strtolower($autorizacion->estado);
            $errorMessage = null;

            if ($status === 'no autorizado') {
                $errorMessage = $this->extractAuthErrors($autorizacion);
            }

            SriLog::create([
                'invoice_id' => $invoice->id,
                'action' => 'authorize',
                'response' => json_encode($autorizacion),
                'status' => $status,
                'error_message' => $errorMessage,
            ]);

            if ($status === 'autorizado') {
                $invoice->update([
                    'status' => 'authorized',
                    'authorized_at' => now(),
                    'authorization_number' => $autorizacion->numeroAutorizacion,
                    'authorization_xml' => $autorizacion->comprobante ?? null,
                ]);
            } elseif ($status === 'no autorizado') {
                $invoice->update(['status' => 'rejected']);
            }

        } catch (\SoapFault $e) {
            SriLog::create([
                'invoice_id' => $invoice->id,
                'action' => 'authorize',
                'status' => 'error',
                'error_message' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    private function extractAuthErrors($autorizacion): string
    {
        $errors = [];

        if (isset($autorizacion->mensajes->mensaje)) {
            $mensajes = $autorizacion->mensajes->mensaje;
            
            if (!is_array($mensajes)) {
                $mensajes = [$mensajes];
            }

            foreach ($mensajes as $mensaje) {
                $errors[] = sprintf(
                    '[%s] %s',
                    $mensaje->identificador ?? 'N/A',
                    $mensaje->mensaje ?? 'Sin descripción'
                );
            }
        }

        return implode(' | ', $errors);
    }
}