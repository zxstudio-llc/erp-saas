<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InvoiceSequenceBlock extends Model
{
    protected $fillable = [
        'establishment_id', 'emission_point_id', 'from_number',
        'to_number', 'current_number', 'status', 'device_id', 'assigned_at'
    ];
    protected $casts = ['assigned_at' => 'datetime'];

    public function establishment(): BelongsTo
    {
        return $this->belongsTo(Establishment::class);
    }

    public function emissionPoint(): BelongsTo
    {
        return $this->belongsTo(EmissionPoint::class);
    }

    public function getNextSequential(): string
    {
        if ($this->current_number >= $this->to_number) {
            $this->update(['status' => 'exhausted']);
            throw new \Exception('Sequence block exhausted');
        }

        $this->increment('current_number');
        
        return sprintf(
            '%03d-%03d-%09d',
            $this->establishment->code,
            $this->emissionPoint->code,
            $this->current_number
        );
    } 
}