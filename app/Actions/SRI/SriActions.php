<?php

namespace App\Actions\SRI;

use App\Models\Invoice;
use App\Models\SriLog;

class BuildSriXmlAction
{
    public function execute(Invoice $invoice): string
    {
        $company = $invoice->company;
        $customer = $invoice->customer;
        $establishment = $invoice->establishment;
        $emissionPoint = $invoice->emissionPoint;

        // Generar clave de acceso (48 dígitos)
        $accessKey = $this->generateAccessKey($invoice);
        $invoice->update(['access_key' => $accessKey]);

        $xml = new \SimpleXMLElement('<?xml version="1.0" encoding="UTF-8"?><factura id="comprobante" version="2.1.0"></factura>');
        
        // InfoTributaria
        $infoTrib = $xml->addChild('infoTributaria');
        $infoTrib->addChild('ambiente', $company->environment === 'prod' ? '2' : '1');
        $infoTrib->addChild('tipoEmision', '1');
        $infoTrib->addChild('razonSocial', $company->business_name);
        $infoTrib->addChild('ruc', $company->ruc);
        $infoTrib->addChild('claveAcceso', $accessKey);
        $infoTrib->addChild('codDoc', '01'); // Factura
        $infoTrib->addChild('estab', str_pad($establishment->code, 3, '0', STR_PAD_LEFT));
        $infoTrib->addChild('ptoEmi', str_pad($emissionPoint->code, 3, '0', STR_PAD_LEFT));
        $infoTrib->addChild('secuencial', str_pad(explode('-', $invoice->sequential)[2], 9, '0', STR_PAD_LEFT));

        // InfoFactura
        $infoFactura = $xml->addChild('infoFactura');
        $infoFactura->addChild('fechaEmision', $invoice->generated_at->format('d/m/Y'));
        $infoFactura->addChild('tipoIdentificacionComprador', $customer->identification_type);
        $infoFactura->addChild('razonSocialComprador', $customer->business_name);
        $infoFactura->addChild('identificacionComprador', $customer->identification);
        $infoFactura->addChild('totalSinImpuestos', number_format($invoice->subtotal, 2, '.', ''));
        $infoFactura->addChild('totalDescuento', '0.00');

        // Impuestos totales
        $totalImpuestos = $infoFactura->addChild('totalConImpuestos');
        $totalImpuesto = $totalImpuestos->addChild('totalImpuesto');
        $totalImpuesto->addChild('codigo', '2'); // IVA
        $totalImpuesto->addChild('codigoPorcentaje', '2'); // 15%
        $totalImpuesto->addChild('baseImponible', number_format($invoice->subtotal, 2, '.', ''));
        $totalImpuesto->addChild('valor', number_format($invoice->tax, 2, '.', ''));

        $infoFactura->addChild('importeTotal', number_format($invoice->total, 2, '.', ''));

        // Detalles
        $detalles = $xml->addChild('detalles');
        foreach ($invoice->items as $item) {
            $detalle = $detalles->addChild('detalle');
            $detalle->addChild('codigoPrincipal', $item->main_code);
            $detalle->addChild('descripcion', $item->description);
            $detalle->addChild('cantidad', number_format($item->quantity, 2, '.', ''));
            $detalle->addChild('precioUnitario', number_format($item->unit_price, 6, '.', ''));
            $detalle->addChild('descuento', number_format($item->discount, 2, '.', ''));
            $detalle->addChild('precioTotalSinImpuesto', number_format($item->subtotal, 2, '.', ''));

            $impuestos = $detalle->addChild('impuestos');
            foreach ($item->taxes as $tax) {
                $impuesto = $impuestos->addChild('impuesto');
                $impuesto->addChild('codigo', $tax['code']);
                $impuesto->addChild('codigoPorcentaje', $tax['rate']);
                $impuesto->addChild('tarifa', $tax['rate']);
                $impuesto->addChild('baseImponible', number_format($item->subtotal, 2, '.', ''));
                $impuesto->addChild('valor', number_format($tax['amount'], 2, '.', ''));
            }
        }

        $xmlString = $xml->asXML();
        $invoice->update(['xml' => $xmlString]);

        return $xmlString;
    }

    private function generateAccessKey(Invoice $invoice): string
    {
        $date = $invoice->generated_at->format('dmY');
        $tipoComprobante = '01';
        $ruc = $invoice->company->ruc;
        $ambiente = $invoice->company->environment === 'prod' ? '2' : '1';
        $serie = str_pad($invoice->establishment->code, 3, '0', STR_PAD_LEFT) . 
                 str_pad($invoice->emissionPoint->code, 3, '0', STR_PAD_LEFT);
        $secuencial = str_pad(explode('-', $invoice->sequential)[2], 9, '0', STR_PAD_LEFT);
        $codigoNumerico = '12345678'; // Random 8 dígitos
        $tipoEmision = '1';

        $base = $date . $tipoComprobante . $ruc . $ambiente . $serie . $secuencial . $codigoNumerico . $tipoEmision;
        $digitoVerificador = $this->modulo11($base);

        return $base . $digitoVerificador;
    }

    private function modulo11(string $cadena): int
    {
        $factor = 2;
        $suma = 0;

        for ($i = strlen($cadena) - 1; $i >= 0; $i--) {
            $suma += intval($cadena[$i]) * $factor;
            $factor = $factor == 7 ? 2 : $factor + 1;
        }

        $residuo = $suma % 11;
        $resultado = 11 - $residuo;

        return $resultado == 11 ? 0 : ($resultado == 10 ? 1 : $resultado);
    }
}

class SignSriDocumentAction
{
    public function execute(Invoice $invoice): void
    {
        // TODO: Implementar firma electrónica con certificado .p12
        // Requiere: phpseclib o Java-based solution
        
        SriLog::create([
            'invoice_id' => $invoice->id,
            'action' => 'validate',
            'status' => 'pending_signature',
        ]);
    }
}

class SendSriDocumentAction
{
    public function execute(Invoice $invoice): void
    {
        $endpoint = $invoice->company->environment === 'prod'
            ? 'https://cel.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline'
            : 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline';

        // TODO: Implementar SOAP request
        
        SriLog::create([
            'invoice_id' => $invoice->id,
            'action' => 'send',
            'request' => $invoice->xml,
            'status' => 'sent',
        ]);

        $invoice->update(['status' => 'sent']);
    }
}

class CheckSriAuthorizationAction
{
    public function execute(Invoice $invoice): void
    {
        $endpoint = $invoice->company->environment === 'prod'
            ? 'https://cel.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline'
            : 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline';

        // TODO: Consultar autorización con clave de acceso
        
        SriLog::create([
            'invoice_id' => $invoice->id,
            'action' => 'authorize',
            'status' => 'authorized',
        ]);

        $invoice->update([
            'status' => 'authorized',
            'authorized_at' => now(),
            'authorization_number' => '1234567890',
        ]);
    }
}
