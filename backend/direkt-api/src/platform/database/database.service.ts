import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from 'pg';

export interface DatabaseReadiness {
  database: string;
  postgisVersion: string;
}

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly pool: Pool;

  constructor(configService: ConfigService) {
    this.pool = new Pool({
      connectionString: configService.getOrThrow<string>('DATABASE_URL'),
      application_name: 'direkt-api',
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
  }

  query<T extends QueryResultRow>(
    text: string,
    values: readonly unknown[] = [],
  ): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, [...values]);
  }

  async transaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await work(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async checkReadiness(): Promise<DatabaseReadiness> {
    const result = await this.query<{
      database: string;
      postgis_version: string;
    }>(
      `SELECT current_database() AS database,
              PostGIS_Version() AS postgis_version`,
    );

    const row = result.rows[0];
    if (!row) {
      throw new Error('Database readiness query returned no row.');
    }

    return {
      database: row.database,
      postgisVersion: row.postgis_version,
    };
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
