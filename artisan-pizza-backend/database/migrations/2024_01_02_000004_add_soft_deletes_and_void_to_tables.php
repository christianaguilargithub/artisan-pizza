<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'deleted_at')) {
                $table->softDeletes();
            }
        });

        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'deleted_at')) {
                $table->softDeletes();
            }
        });

        Schema::table('order_items', function (Blueprint $table) {
            if (!Schema::hasColumn('order_items', 'deleted_at')) {
                $table->softDeletes();
            }
        });

        Schema::table('payments', function (Blueprint $table) {
            if (!Schema::hasColumn('payments', 'deleted_at')) {
                $table->softDeletes();
            }
            if (!Schema::hasColumn('payments', 'voided_at')) {
                $table->timestamp('voided_at')->nullable()->after('status');
            }
            if (!Schema::hasColumn('payments', 'voided_by')) {
                $table->unsignedBigInteger('voided_by')->nullable()->after('voided_at');
                $table->foreign('voided_by')->references('id')->on('users')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['voided_by']);
            $table->dropColumn(['voided_at', 'voided_by', 'deleted_at']);
        });

        foreach (['order_items', 'products', 'orders'] as $tbl) {
            Schema::table($tbl, function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }
    }
};
