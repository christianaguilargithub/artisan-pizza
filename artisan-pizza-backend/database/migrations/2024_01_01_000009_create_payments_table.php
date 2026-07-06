<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->string('payment_method'); // cash, qr, card
            $table->decimal('amount_tendered', 10, 2);
            $table->decimal('change_given', 10, 2)->default(0);
            $table->string('qr_reference')->nullable();
            $table->string('status')->default('pending'); // pending, paid, failed
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
