import VCLJwt from '../../../api/entities/VCLJwt';
import VCLSubmission from '../../../api/entities/VCLSubmission';
import VCLSubmissionResult from '../../../api/entities/VCLSubmissionResult';

export default interface SubmissionRepository {
    submit(
        submission: VCLSubmission,
        jwt: VCLJwt
    ): Promise<VCLSubmissionResult>;
}
