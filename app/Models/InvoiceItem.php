<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InvoiceItem extends Model
{
    protected $fillable = [
        'invoice_id', 'main_code', 'auxiliary_code', 'description',
        'quantity', 'unit_price', 'discount', 'subtotal', 'taxes', 'total'
    ];
    protected $casts = ['taxes' => 'array'];

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }
}
