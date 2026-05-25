/**
 * Skill Integration Script
 * Runs tester and developer skills together with GitHub push workflow
 */

async function runSkillWorkflow() {
    console.log('🚀 Starting Skill Workflow...\n');
    
    // Initialize tester skill
    const tester = new TesterSkill();
    
    // Run tests
    const testResults = await tester.runAllTests();
    
    console.log('\n🔄 Passing suggestions to developer skill...\n');
    
    // Initialize developer skill
    const developer = new DeveloperSkill();
    
    // Store developer globally for browser environment
    if (typeof window !== 'undefined') {
        window.developer = developer;
    }
    
    // Process suggestions
    const implementationResults = await developer.processSuggestions(testResults.suggestions);
    
    console.log('\n📋 Requesting approval for changes...\n');
    
    // Request approval for implemented changes
    const pendingApproval = await developer.requestApproval();
    
    console.log('\n✨ Implementation Complete! Ready for approval.\n');
    
    return {
        testResults: testResults,
        implementationResults: implementationResults,
        pendingApproval: pendingApproval,
        developer: developer
    };
}

/**
 * Approve changes and push to GitHub
 */
async function approveAndPush(developer, changeIndices, commitMessage) {
    console.log('\n🔄 APPROVAL AND PUSH WORKFLOW\n');
    
    // Approve the specified changes
    developer.approveChanges(changeIndices);
    
    // Push to GitHub
    const pushResult = await developer.pushToGitHub(commitMessage);
    
    console.log('\n✨ Workflow Complete!\n');
    
    return pushResult;
}

// Global developer instance for browser environment
let globalDeveloper = null;

// Run the workflow
if (typeof window !== 'undefined') {
    // Browser environment
    window.runSkillWorkflow = runSkillWorkflow;
    window.approveAndPush = approveAndPush;
    console.log('Skill workflow ready.');
    console.log('Run: const result = await runSkillWorkflow() to start the workflow');
    console.log('Then: approveAndPush(result.developer, [0,1,2], "commit message") to approve and push');
} else {
    // Node.js environment
    runSkillWorkflow();
}