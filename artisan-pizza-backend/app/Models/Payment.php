<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'order_id',
        'payment_method',
        'amount_tendered',
        'change_given',
        'qr_reference',
        'status',
        'voided_at',
        'voided_by',
    ];

    protected $casts = [
        'amount_tendered' => 'decimal:2',
        'change_given'    => 'decimal:2',
        'voided_at'       => 'datetime',
        'deleted_at'      => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
