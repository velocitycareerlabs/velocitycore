import VCLSubmission from '../../../api/entities/VCLSubmission';
import VCLSubmissionResult from '../../../api/entities/VCLSubmissionResult';

export default interface SubmissionUseCase {
    submit(submission: VCLSubmission): Promise<VCLSubmissionResult>;
}
