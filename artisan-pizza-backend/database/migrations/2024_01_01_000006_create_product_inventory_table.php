<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_inventory', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->foreignId('inventory_item_id')->constrained('inventory_items')->onDelete('cascade');
            $table->integer('qty_used');
            $table->integer('author');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_inventory');
    }
};
