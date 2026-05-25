/**
 * Continuous Automation Script
 * Runs tester-developer workflow on a schedule
 */

// Import skill classes
const testerSkillModule = require('./tester-skill.js');
const developerSkillModule = require('./developer-skill.js');

// Get the classes from the exports
const TesterSkill = testerSkillModule.TesterSkill || testerSkillModule;
const DeveloperSkill = developerSkillModule.DeveloperSkill || developerSkillModule;

// Configuration
const config = {
    // Run interval in milliseconds (default: 1 hour)
    runInterval: 60 * 60 * 1000,
    
    // Auto-approve all changes (use with caution)
    autoApprove: false,
    
    // Auto-push to GitHub after approval
    autoPush: false,
    
    // Commit message template
    commitMessage: 'Automated improvement from tester-developer workflow',
    
    // Maximum number of changes to auto-approve per run
    maxAutoApproveChanges: 5,
    
    // Log file path
    logFile: './automation.log',
    
    // Enable GitHub integration
    enableGitHub: true
};

/**
 * Run the complete workflow
 */
async function runWorkflow() {
    const timestamp = new Date().toISOString();
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 Starting Automated Workflow - ${timestamp}`);
    console.log(`${'='.repeat(60)}\n`);
    
    try {
        // Initialize tester skill
        const tester = new TesterSkill();
        
        // Run tests
        console.log('📊 Running tests...');
        const testResults = await tester.runAllTests();
        
        console.log(`\n✅ Tests completed: ${testResults.passed}/${testResults.total} passed`);
        console.log(`📝 Suggestions generated: ${testResults.suggestions.length}`);
        
        // Initialize developer skill
        const developer = new DeveloperSkill();
        
        // Process suggestions
        console.log('\n🔧 Processing suggestions...');
        const implementationResults = await developer.processSuggestions(testResults.suggestions);
        
        console.log(`\n✅ Changes implemented: ${implementationResults.length}`);
        
        // Handle approval
        if (config.autoApprove && implementationResults.length > 0) {
            console.log('\n🔄 Auto-approving changes...');
            
            // Approve changes up to the maximum limit
            const changesToApprove = implementationResults
                .slice(0, config.maxAutoApproveChanges)
                .map((_, index) => index);
            
            developer.approveChanges(changesToApprove);
            
            console.log(`✅ Approved ${changesToApprove.length} changes`);
            
            // Push to GitHub if enabled
            if (config.autoPush && config.enableGitHub) {
                console.log('\n📤 Pushing to GitHub...');
                const pushResult = await developer.pushToGitHub(config.commitMessage);
                console.log(`✅ Push successful: ${pushResult.success}`);
            }
        } else {
            console.log('\n⏸️  Changes pending manual approval');
            console.log('Run the workflow in browser to review and approve changes');
        }
        
        console.log(`\n${'='.repeat(60)}`);
        console.log(`✨ Workflow Complete - ${new Date().toISOString()}`);
        console.log(`${'='.repeat(60)}\n`);
        
        return {
            success: true,
            testResults,
            implementationResults,
            timestamp
        };
        
    } catch (error) {
        console.error(`\n❌ Workflow failed: ${error.message}`);
        console.error(error.stack);
        
        return {
            success: false,
            error: error.message,
            timestamp
        };
    }
}

/**
 * Start continuous automation
 */
function startAutomation() {
    console.log('🤖 Starting Continuous Automation...');
    console.log(`⏱️  Run interval: ${config.runInterval / 1000} seconds`);
    console.log(`🔧 Auto-approve: ${config.autoApprove}`);
    console.log(`📤 Auto-push: ${config.autoPush}`);
    console.log(`🔗 GitHub integration: ${config.enableGitHub}\n`);
    
    // Run immediately on start
    runWorkflow();
    
    // Schedule recurring runs
    setInterval(() => {
        runWorkflow();
    }, config.runInterval);
}

/**
 * Stop automation (if needed)
 */
function stopAutomation() {
    console.log('🛑 Stopping Continuous Automation...');
    // In a real implementation, you would clear the interval
    process.exit(0);
}

// Command line interface
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.includes('--once')) {
        // Run once and exit
        runWorkflow().then(() => process.exit(0));
    } else if (args.includes('--config')) {
        // Display current configuration
        console.log('Current Configuration:');
        console.log(JSON.stringify(config, null, 2));
        process.exit(0);
    } else {
        // Start continuous automation
        startAutomation();
    }
}

// Export for use in other modules
module.exports = {
    runWorkflow,
    startAutomation,
    stopAutomation,
    config
};
