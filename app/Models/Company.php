<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Company extends Model
{
    protected $fillable = [
        'ruc', 'business_name', 'trade_name', 'environment',
        'address', 'special_taxpayer', 'accounting_required'
    ];
    protected $casts = [
        'special_taxpayer' => 'boolean',
        'accounting_required' => 'boolean'
    ];

    public function establishments(): HasMany
    {
        return $this->hasMany(Establishment::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }
}