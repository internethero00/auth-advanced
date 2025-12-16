import { DynamicModule, Module } from '@nestjs/common';
import {
  ProviderOptionSymbol,
  TypeAsyncOptions,
  TypeOptions,
} from './provider.constants';
import { ProviderService } from './provider.service';

@Module({})
export class ProviderModule {
  public static register(options: TypeOptions): DynamicModule {
    return {
      module: ProviderModule,
      providers: [
        {
          useValue: options,
          provide: ProviderOptionSymbol,
        },
        ProviderService,
      ],
      exports: [ProviderService],
    };
  }
  public static registerAsync(options: TypeAsyncOptions): DynamicModule {
    return {
      module: ProviderModule,
      imports: options.imports,
      providers: [
        {
          provide: ProviderOptionSymbol,
          useFactory: options.useFactory,
          inject: options.inject,
        },
        ProviderService,
      ],
      exports: [ProviderService],
    };
  }
}
