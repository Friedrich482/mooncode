import { prettifyError, ZodType } from "zod";

import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class ZodPipe<T> implements PipeTransform {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown) {
    const parsedValue = this.schema.safeParse(value);

    if (!parsedValue.success) {
      throw new BadRequestException(prettifyError(parsedValue.error));
    }

    return parsedValue.data;
  }
}
