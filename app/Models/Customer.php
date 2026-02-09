<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'identification_type',
        'identification',
        'business_name',
        'email',
        'phone',
        'address',
        'active'
    ];
    
    protected $casts = ['active' => 'boolean'];

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }
}