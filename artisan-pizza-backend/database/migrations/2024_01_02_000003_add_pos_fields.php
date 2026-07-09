<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // discount_id, discount_amount, tax_amount, notes, refunded_at already exist from prior session
        // Only add shift_id if missing
        if (!Schema::hasColumn('orders', 'shift_id')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->foreignId('shift_id')->nullable()->constrained('shifts')->nullOnDelete()->after('user_id');
            });
        }

        // low_stock_threshold already exists
    }

    public function down(): void
    {
        if (Schema::hasColumn('orders', 'shift_id')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->dropConstrainedForeignId('shift_id');
            });
        }
    }
};
