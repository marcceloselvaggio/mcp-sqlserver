import sql from "mssql";
import { Tool } from "@modelcontextprotocol/sdk/types.js";

export class ListTableTool implements Tool {
  [key: string]: any;
  name = "list_table";
  description = "Lists tables in an MSSQL Database, or list tables in specific schemas";
  inputSchema = {
    type: "object",
    properties: {
      parameters: { 
        type: "array", 
        description: "Schemas to filter by (optional)",
        items: {
          type: "string"
        },
        minItems: 0
      },
    },
    required: [],
  } as any;

  async run(params: any) {
    try {
      const { parameters } = params;
      const request = new sql.Request();
      const schemaFilter = parameters && parameters.length > 0 ? `AND TABLE_SCHEMA IN (${parameters.map((p: string) => `'${p}'`).join(", ")})` : "";
      const query = `SELECT TABLE_SCHEMA + '.' + TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ${schemaFilter} ORDER BY TABLE_SCHEMA, TABLE_NAME`;
      const result = await request.query(query);
      return {
        success: true,
        message: `List tables executed successfully`,
        items: result.recordset,
      };
    } catch (error) {
      console.error("Error listing tables:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorDetails = error instanceof Error && (error as any).code
        ? `Error Code: ${(error as any).code}`
        : '';
      return {
        success: false,
        message: `Failed to list tables: ${errorMessage}${errorDetails ? '. ' + errorDetails : ''}`,
        error: errorMessage,
        errorCode: (error as any).code,
        errorNumber: (error as any).number,
      };
    }
  }
}
