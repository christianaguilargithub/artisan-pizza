<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Shift extends Model
{
    protected $fillable = [
        'user_id', 'opening_cash', 'closing_cash', 'expected_cash',
        'total_sales', 'total_orders', 'status', 'opened_at', 'closed_at', 'notes',
    ];

    protected $casts = [
        'opening_cash'  => 'decimal:2',
        'closing_cash'  => 'decimal:2',
        'expected_cash' => 'decimal:2',
        'total_sales'   => 'decimal:2',
        'opened_at'     => 'datetime',
        'closed_at'     => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
