<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'shift_id')) {
                $table->foreignId('shift_id')->nullable()->constrained('shifts')->nullOnDelete()->after('user_id');
            }
            // Add FK constraint for discount_id now that discounts table exists
            if (Schema::hasColumn('orders', 'discount_id')) {
                try {
                    $table->foreign('discount_id')->references('id')->on('discounts')->nullOnDelete();
                } catch (\Exception $e) {
                    // FK may already exist on existing DB
                }
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'shift_id')) {
                $table->dropConstrainedForeignId('shift_id');
            }
        });
    }
};
