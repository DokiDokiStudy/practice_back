import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

export const ApiSuccessResponse = <T extends Type<any>>(
  message: string,
  model?: T,
) => {
  const schema: { properties: Record<string, object> } = {
    properties: {
      statusCode: { type: 'number', example: 200 },
      message: { type: 'string', example: message },
    },
  };

  if (model) {
    schema.properties.data = {
      type: 'object',
      $ref: getSchemaPath(model),
    };
  }

  return applyDecorators(
    ApiOkResponse({
      schema: {
        type: 'object',
        properties: schema.properties,
      },
    }),
  );
};
