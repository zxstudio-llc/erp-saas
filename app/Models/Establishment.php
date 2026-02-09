<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Establishment extends Model
{
    protected $fillable = ['company_id', 'code', 'name', 'address', 'latitude', 'longitude', 'active'];
    protected $casts = ['active' => 'boolean'];
    protected $appends = ['is_main'];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function emissionPoints(): HasMany
    {
        return $this->hasMany(EmissionPoint::class);
    }
    public function getIsMainAttribute() {
        return $this->code === '001';
    }
    public static function nextCodeForCompany($companyId): string
    {
        $lastCode = self::where('company_id', $companyId)->max('code');
        if (!$lastCode) return '001';
        
        return sprintf('%03d', intval($lastCode) + 1);
    }

    public function sequenceBlocks(): HasMany
    {
        return $this->hasMany(InvoiceSequenceBlock::class, 'establishment_id');
    }

}