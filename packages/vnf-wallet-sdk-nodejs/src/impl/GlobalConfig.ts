import VCLEnvironment from '../api/VCLEnvironment';
import VCLXVnfProtocolVersion from '../api/VCLXVnfProtocolVersion';
import { VCLLogService } from '../api/entities/initialization/VCLLogService';
import VCLLog from './utils/VCLLog';

export default class GlobalConfig {
    private static _IsDebugOn = false;

    public static get IsDebugOn() {
        return this._IsDebugOn;
    }

    public static set IsDebugOn(value) {
        this._IsDebugOn = value;
        VCLLog.IsLoggerOn = this.IsLoggerOn;
    }

    private static _CurrentEnvironment = VCLEnvironment.Prod;

    public static get CurrentEnvironment() {
        return this._CurrentEnvironment;
    }

    public static set CurrentEnvironment(value) {
        this._CurrentEnvironment = value;
    }

    private static _XVnfProtocolVersion =
        VCLXVnfProtocolVersion.XVnfProtocolVersion1;

    public static get XVnfProtocolVersion() {
        return this._XVnfProtocolVersion;
    }

    public static set XVnfProtocolVersion(value) {
        this._XVnfProtocolVersion = value;
    }

    private static _IsDirectIssuerOn = true;

    public static get IsDirectIssuerOn() {
        return this._IsDirectIssuerOn;
    }

    private static set IsDirectIssuerOn(value) {
        this._IsDirectIssuerOn = value;
    }

    public static init(
        isDebugOn = false,
        currentEnvironment: VCLEnvironment = VCLEnvironment.Prod,
        xVnfProtocolVersion: VCLXVnfProtocolVersion = VCLXVnfProtocolVersion.XVnfProtocolVersion1,
        logService: VCLLogService,
        isDirectIssuerOn = true
    ) {
        GlobalConfig.IsDebugOn = isDebugOn;
        GlobalConfig.CurrentEnvironment = currentEnvironment;
        GlobalConfig.XVnfProtocolVersion = xVnfProtocolVersion;
        GlobalConfig.initLogger(logService);
        GlobalConfig.IsDirectIssuerOn = isDirectIssuerOn;
    }

    private static initLogger(value: VCLLogService) {
        VCLLog.LoggerService = value;
        VCLLog.IsLoggerOn = this.IsLoggerOn;
    }

    public static get IsLoggerOn() {
        return (
            (this.CurrentEnvironment !== VCLEnvironment.Staging &&
                this.CurrentEnvironment !== VCLEnvironment.Prod) ||
            this.IsDebugOn
        );
    }
}
