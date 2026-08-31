<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Vérifier si l'index existe avant de le supprimer
        $indexExists = DB::select("
            SELECT COUNT(*) as count 
            FROM information_schema.STATISTICS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'api_keys' 
            AND COLUMN_NAME = 'key'
        ");

        if ($indexExists[0]->count > 0) {
            // Récupérer le nom exact de l'index
            $indexName = DB::select("
                SELECT INDEX_NAME 
                FROM information_schema.STATISTICS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'api_keys' 
                AND COLUMN_NAME = 'key'
                LIMIT 1
            ");

            if (!empty($indexName)) {
                DB::statement("ALTER TABLE api_keys DROP INDEX {$indexName[0]->INDEX_NAME}");
            }
        }

        // Modifier les colonnes en TEXT
        DB::statement('ALTER TABLE api_keys MODIFY COLUMN `key` TEXT');
        DB::statement('ALTER TABLE api_keys MODIFY COLUMN `secret` TEXT');

        // Recréer l'index avec une longueur
        DB::statement('CREATE UNIQUE INDEX api_keys_key_unique ON api_keys (key(191))');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE api_keys DROP INDEX api_keys_key_unique');
        DB::statement('ALTER TABLE api_keys MODIFY COLUMN `key` VARCHAR(255)');
        DB::statement('ALTER TABLE api_keys MODIFY COLUMN `secret` VARCHAR(255)');
    }
};