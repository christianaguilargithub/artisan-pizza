<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'order_id',
        'payment_method',
        'amount_tendered',
        'change_given',
        'qr_reference',
        'status',
    ];

    protected $casts = [
        'amount_tendered' => 'decimal:2',
        'change_given'    => 'decimal:2',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
