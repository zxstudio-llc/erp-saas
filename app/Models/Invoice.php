<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Invoice extends Model
{
    protected $fillable = [
        'company_id', 'customer_id', 'establishment_id', 'emission_point_id',
        'sequence_block_id', 'sequential', 'access_key', 'subtotal', 'tax',
        'total', 'status', 'offline', 'device_id', 'xml', 'authorization_xml',
        'authorization_number', 'generated_at', 'synced_at', 'authorized_at'
    ];

    protected $casts = [
        'offline' => 'boolean',
        'generated_at' => 'datetime',
        'synced_at' => 'datetime',
        'authorized_at' => 'datetime',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function sequenceBlock(): BelongsTo
    {
        return $this->belongsTo(InvoiceSequenceBlock::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function sriLogs(): HasMany
    {
        return $this->hasMany(SriLog::class);
    }
}
