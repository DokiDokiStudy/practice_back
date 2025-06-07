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
    console.log(getSchemaPath(model));

    schema.properties.data = {
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
