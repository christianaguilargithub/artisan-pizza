<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class InventoryItem extends Model
{
    protected $fillable = ['name', 'unit', 'quantity', 'author'];

    protected $casts = [
        'quantity' => 'decimal:2',
    ];

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'product_inventory')
            ->withPivot('qty_used', 'author')
            ->withTimestamps();
    }
}
