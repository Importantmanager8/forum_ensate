import HomepageSettings from '../models/homepage.settings.model.js';
import Company from '../models/company.model.js';

// Get homepage settings
const getHomepageSettings = async (req, res) => {
    try {
        console.log('Fetching homepage settings...');
        const settings = await HomepageSettings.findOne();
        
        if (!settings) {
            return res.status(404).json({ message: 'Homepage settings not found' });
        }
        
        console.log('Found settings:', settings);
        console.log('Populating company ranks...');
        
        await settings.populate('companyRanks.companyId');
        
        console.log('Populated settings:', settings.toObject());

        // Transform the data to match the frontend expectations
        const transformedSettings = {
            ...settings.toObject(),
            companyRanks: settings.companyRanks
                .filter(rank => rank.companyId) // Filter out any null companyIds
                .map(rank => ({
                    companyId: {
                        _id: rank.companyId._id,
                        name: rank.companyId.name,
                        logo: rank.companyId.logo
                    },
                    rank: rank.rank,
                }))
        };

        res.json(transformedSettings);
    } catch (error) {
        console.error('Error getting homepage settings:', error);
        res.status(500).json({ message: 'Error retrieving homepage settings', error: error.message });
    }
};

// Create or update homepage settings
const updateHomepageSettings = async (req, res) => {
    try {
        const {
            schoolInfo,
            timeline,
            companyRanks,
            sponsors
        } = req.body;

        // Validate required fields
        if (!schoolInfo || !schoolInfo.name || !schoolInfo.description) {
            return res.status(400).json({ message: 'School information is required' });
        }

        // Validate and filter company ranks
        let validCompanyRanks = [];
        if (Array.isArray(companyRanks)) {
            // Get all existing company IDs
            const existingCompanies = await Company.find({}, '_id');
            const existingCompanyIds = new Set(existingCompanies.map(c => c._id.toString()));

            // Filter company ranks to only include existing companies
            validCompanyRanks = companyRanks.filter(rank => {
                const isValid = rank.companyId && existingCompanyIds.has(rank.companyId.toString());
                if (!isValid) {
                    console.log(`Removing invalid company rank for company ID: ${rank.companyId}`);
                }
                return isValid;
            });
        }

        // Find existing settings or create new one
        let settings = await HomepageSettings.findOne();

        if (settings) {
            // Update existing settings
            settings.schoolInfo = schoolInfo;
            settings.timeline = timeline || [];
            settings.companyRanks = validCompanyRanks;
            settings.sponsors = sponsors || [];
        } else {
            // Create new settings
            settings = new HomepageSettings({
                schoolInfo,
                timeline: timeline || [],
                companyRanks: validCompanyRanks,
                sponsors: sponsors || []
            });
        }

        await settings.save();
        res.json({ message: 'Homepage settings updated successfully', settings });
    } catch (error) {
        console.error('Error updating homepage settings:', error);
        res.status(500).json({ message: 'Error updating homepage settings', error: error.message });
    }
};

// Reset homepage settings to default
const resetHomepageSettings = async (req, res) => {
    try {
        await HomepageSettings.deleteOne();
        res.json({ message: 'Homepage settings reset successfully' });
    } catch (error) {
        console.error('Error resetting homepage settings:', error);
        res.status(500).json({ message: 'Error resetting homepage settings', error: error.message });
    }
};

export {
    getHomepageSettings,
    updateHomepageSettings,
    resetHomepageSettings
};
