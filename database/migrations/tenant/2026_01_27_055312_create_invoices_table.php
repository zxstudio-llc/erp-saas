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
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('establishment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('emission_point_id')->constrained()->cascadeOnDelete();
            $table->foreignId('sequence_block_id')->constrained('invoice_sequence_blocks');
            $table->string('sequential', 17); // 001-001-000000001
            $table->string('access_key', 49)->nullable()->unique();
            $table->decimal('subtotal', 12, 2);
            $table->decimal('tax', 12, 2);
            $table->decimal('total', 12, 2);
            $table->enum('status', ['offline_pending', 'sent', 'authorized', 'rejected', 'error'])->default('offline_pending');
            $table->boolean('offline')->default(false);
            $table->string('device_id')->nullable();
            $table->text('xml')->nullable();
            $table->text('authorization_xml')->nullable();
            $table->string('authorization_number')->nullable();
            $table->timestamp('generated_at');
            $table->timestamp('synced_at')->nullable();
            $table->timestamp('authorized_at')->nullable();
            $table->softDeletes();
            $table->timestamps();
            
            $table->index(['company_id', 'status']);
            $table->index(['device_id', 'offline']);
            $table->index('sequential');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
