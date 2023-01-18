import { IRayObject } from '@/interfaces/ray.interface';
import * as NotionApi from '@notionhq/client';
export class RayNotionApiUtils {
  private notionClient: NotionApi.Client;
  private rayDatabaseId = '';
  constructor() {
    this.notionClient = new NotionApi.Client({
      auth: process.env.NOTION_TOKEN,
    });
    this.rayDatabaseId = process.env.RAY_NOTION_DATABASE_ID;
  }
  async getAllUserInfo() {
    const res = await this.notionClient.users.list({});
    return res;
  }
  async getRayDatabase() {
    const res = await this.notionClient.databases.query({
      database_id: this.rayDatabaseId,
    });
    return res;
  }
  async addRowToRay(id: string, ray: IRayObject) {
    const res = await this.notionClient.pages.create({
      parent: {
        database_id: this.rayDatabaseId,
      },
      properties: {
        _id: {
          title: [
            {
              text: {
                content: id,
              },
            },
          ],
        },
        createAt: {
          date: {
            start: ray.createAt.toISOString(),
          },
        },
        sv: {
          number: ray.rayInSievert,
        },
        source: {
          rich_text: [
            {
              text: {
                content: ray.dataSource,
              },
            },
          ],
        },
      },
    });
    return res;
  }
}
