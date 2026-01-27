<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('sri_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained()->cascadeOnDelete();
            $table->enum('action', ['validate', 'send', 'authorize', 'retry']);
            $table->longText('request')->nullable();
            $table->longText('response')->nullable();
            $table->string('status');
            $table->string('error_message')->nullable();
            $table->timestamps();
            
            $table->index(['invoice_id', 'action']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sri_logs');
    }
};
