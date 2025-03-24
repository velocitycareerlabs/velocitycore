import pino from 'pino';
import {
    VCLLogService,
    LogFn,
} from '../../api/entities/initialization/VCLLogService';

export default class VCLLog {
    private static _LoggerService: VCLLogService = pino();

    static get LoggerService(): VCLLogService {
        return this._LoggerService;
    }

    static set LoggerService(value: VCLLogService) {
        this._LoggerService = value || pino();
    }

    private static _IsLoggerOn = false;

    static get IsLoggerOn(): boolean {
        return this._IsLoggerOn;
    }

    static set IsLoggerOn(value: boolean) {
        this._IsLoggerOn = value;
    }

    static error: LogFn = (obj: any, msg?: string, ...args: any[]) => {
        // always log errors
        this.LoggerService.error(obj, msg, ...args);
    };

    static warn: LogFn = (obj: any, msg?: string, ...args: any[]) => {
        // eslint-disable-next-line no-unused-expressions
        this.IsLoggerOn && this.LoggerService.warn(obj, msg, ...args);
    };

    static info: LogFn = (obj: any, msg?: string, ...args: any[]) => {
        // eslint-disable-next-line no-unused-expressions
        this.IsLoggerOn && this.LoggerService.info(obj, msg, ...args);
    };
}
