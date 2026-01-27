<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EmissionPoint extends Model
{
    protected $fillable = ['establishment_id', 'code', 'name', 'active'];
    protected $casts = ['active' => 'boolean'];

    public function establishment(): BelongsTo
    {
        return $this->belongsTo(Establishment::class);
    }

    public function sequenceBlocks(): HasMany
    {
        return $this->hasMany(InvoiceSequenceBlock::class);
    }
}