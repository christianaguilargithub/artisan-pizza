<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class InventoryItem extends Model
{
    protected $fillable = ['name', 'unit', 'quantity', 'low_stock_threshold', 'author'];

    protected $casts = [
        'quantity'            => 'decimal:2',
        'low_stock_threshold' => 'decimal:2',
    ];

    protected $appends = ['is_low_stock'];

    public function getIsLowStockAttribute(): bool
    {
        return $this->low_stock_threshold > 0 && $this->quantity <= $this->low_stock_threshold;
    }

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'product_inventory')
            ->withPivot('qty_used', 'author')
            ->withTimestamps();
    }
}
