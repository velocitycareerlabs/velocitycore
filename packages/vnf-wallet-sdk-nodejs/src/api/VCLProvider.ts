import { VCLImpl } from '../impl/VCLImpl';
import VCL from './VCL';

export default class VCLProvider {
    private static vclInstance: VCL | null = null;

    // Private constructor to prevent external instantiation
    private constructor() {
        // Do nothing
    }

    public static getInstance(): VCL {
        // Double-checked locking pattern
        if (VCLProvider.vclInstance === null) {
            // Lock this section
            // Assume some form of synchronization, like a mutex
            if (VCLProvider.vclInstance === null) {
                VCLProvider.vclInstance = new VCLImpl();
            }
        }
        return VCLProvider.vclInstance;
    }
}
