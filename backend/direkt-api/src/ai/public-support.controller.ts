import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
import { PublicRoute } from '../authorization/public.decorator';
import { PublicSupportService } from './public-support.service';

class PublicSupportAssistDto {
  @IsString()
  @Length(3, 500)
  question!: string;
}

@ApiTags('public support')
@Controller('public/support')
export class PublicSupportController {
  constructor(private readonly support: PublicSupportService) {}

  @Post('assist')
  @PublicRoute()
  @ApiOperation({
    summary: 'Answers a bounded synthetic help question from approved public DIREKT facts.',
  })
  @ApiOkResponse({
    description:
      'Returns grounded AI-assisted or deterministic public help with source identifiers and explicit limitations.',
  })
  assist(@Body() body: PublicSupportAssistDto) {
    return this.support.assist(body.question);
  }
}
