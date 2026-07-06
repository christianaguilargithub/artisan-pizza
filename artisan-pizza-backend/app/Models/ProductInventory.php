<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

class ProductInventory extends Pivot
{
    protected $table = 'product_inventory';

    protected $fillable = ['product_id', 'inventory_item_id', 'qty_used', 'author'];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class);
    }
}
