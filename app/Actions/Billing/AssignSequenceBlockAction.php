<?php

namespace App\Actions\Billing;

use App\Models\InvoiceSequenceBlock;
use App\Models\Establishment;
use App\Models\EmissionPoint;
use Illuminate\Support\Facades\DB;

class AssignSequenceBlockAction
{
    /**
     * Asigna un bloque de secuenciales exclusivo para un dispositivo
     */
    public function execute(
        Establishment $establishment,
        EmissionPoint $emissionPoint,
        string $deviceId,
        int $blockSize = 100
    ): InvoiceSequenceBlock {
        return DB::transaction(function () use ($establishment, $emissionPoint, $deviceId, $blockSize) {
            // Obtener último bloque usado
            $lastBlock = InvoiceSequenceBlock::where('establishment_id', $establishment->id)
                ->where('emission_point_id', $emissionPoint->id)
                ->orderBy('to_number', 'desc')
                ->lockForUpdate()
                ->first();

            $fromNumber = $lastBlock ? $lastBlock->to_number + 1 : 1;
            $toNumber = $fromNumber + $blockSize - 1;

            return InvoiceSequenceBlock::create([
                'establishment_id' => $establishment->id,
                'emission_point_id' => $emissionPoint->id,
                'from_number' => $fromNumber,
                'to_number' => $toNumber,
                'current_number' => $fromNumber - 1,
                'status' => 'available',
                'device_id' => $deviceId,
                'assigned_at' => now(),
            ]);
        });
    }
}
