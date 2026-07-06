<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('restrict');
            $table->integer('queue_number');
            $table->string('order_source'); // dine-in, online, walk-in
            $table->string('status')->default('pending'); // pending, preparing, ready, completed, cancelled
            $table->decimal('total_amount', 10, 2);
            $table->timestamp('called_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
