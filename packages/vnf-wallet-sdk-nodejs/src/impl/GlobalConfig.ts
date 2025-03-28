import VCLEnvironment from '../api/VCLEnvironment';
import VCLXVnfProtocolVersion from '../api/VCLXVnfProtocolVersion';

export default class GlobalConfig {
    private static _IsDebugOn = false;

    public static get IsDebugOn() {
        return this._IsDebugOn;
    }

    public static set IsDebugOn(value) {
        this._IsDebugOn = value;
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
        isDirectIssuerOn = true
    ) {
        GlobalConfig.IsDebugOn = isDebugOn;
        GlobalConfig.CurrentEnvironment = currentEnvironment;
        GlobalConfig.XVnfProtocolVersion = xVnfProtocolVersion;
        GlobalConfig.IsDirectIssuerOn = isDirectIssuerOn;
    }

    public static get IsLoggerOn() {
        return (
            (this.CurrentEnvironment !== VCLEnvironment.Staging &&
                this.CurrentEnvironment !== VCLEnvironment.Prod) ||
            this.IsDebugOn
        );
    }
}
