import mongoose from 'mongoose';
import Authority from '../models/Authority.js';

const seedAuthorities = async () => {
  try {
    const count = await Authority.countDocuments();
    if (count === 0) {
      console.log('Seeding mock authorities...');
      const mockAuthorities = [
        // Municipalities
        {
          name: 'San Francisco Public Works Department',
          type: 'Municipality',
          contact: '+1 (415) 554-6927',
          email: 'sfpublicworks@sfgov.org',
          location: { lat: 37.7699, lng: -122.4468, address: '2323 Cesar Chavez St, San Francisco, CA' }
        },
        {
          name: 'NYC Department of Sanitation',
          type: 'Municipality',
          contact: '+1 (212) 639-9675',
          email: 'dsnyinfo@dsny.nyc.gov',
          location: { lat: 40.7259, lng: -73.9968, address: '125 Worth St, New York, NY' }
        },
        // Fire Force
        {
          name: 'Bay Area Fire & Rescue Station 3',
          type: 'Fire Force',
          contact: '+1 (415) 558-3200',
          email: 'sffire3@sfgov.org',
          location: { lat: 37.7801, lng: -122.4120, address: '1067 Post St, San Francisco, CA' }
        },
        {
          name: 'Manhattan Fire & Rescue Station 9',
          type: 'Fire Force',
          contact: '+1 (212) 555-0199',
          email: 'fdny9@nyc.gov',
          location: { lat: 40.7580, lng: -73.9855, address: '253 E 33rd St, New York, NY' }
        },
        // Animal Hospitals
        {
          name: 'SF Animal Emergency & Specialty Hospital',
          type: 'Animal Hospital',
          contact: '+1 (415) 566-0540',
          email: 'emergencies@sfanimalhospital.com',
          location: { lat: 37.7512, lng: -122.4201, address: '2201 Taraval St, San Francisco, CA' }
        },
        {
          name: 'NYC Veterinary Emergency Care Center',
          type: 'Animal Hospital',
          contact: '+1 (212) 555-0210',
          email: 'nycemergency@nycvet.com',
          location: { lat: 40.7302, lng: -74.0005, address: '410 W 55th St, New York, NY' }
        },
        // Veterinary Hospitals / Clinics
        {
          name: 'Mission District Veterinary Clinic',
          type: 'Veterinary Hospital',
          contact: '+1 (415) 555-0344',
          email: 'missionvet@missionclinic.com',
          location: { lat: 37.7599, lng: -122.4148, address: '2800 24th St, San Francisco, CA' }
        },
        {
          name: 'Central Park Veterinary Care Clinic',
          type: 'Veterinary Hospital',
          contact: '+1 (212) 555-0455',
          email: 'info@centralparkvet.com',
          location: { lat: 40.7711, lng: -73.9741, address: '12 W 72nd St, New York, NY' }
        },
        // Forest Offices
        {
          name: 'Golden Gate Forestry & Wildlife Office',
          type: 'Forest Office',
          contact: '+1 (415) 555-0810',
          email: 'goldengatewildlife@forestry.ca.gov',
          location: { lat: 37.7694, lng: -122.4862, address: '100 Great Hwy, San Francisco, CA' }
        },
        {
          name: 'New York State Wildlife & Forest Rangers',
          type: 'Forest Office',
          contact: '+1 (845) 555-0900',
          email: 'rangers@dec.ny.gov',
          location: { lat: 41.2167, lng: -74.1167, address: 'Harriman State Park Ranger Station, NY' }
        }
      ];

      await Authority.insertMany(mockAuthorities);
      console.log('Seeded authorities successfully!');
    }
  } catch (error) {
    console.error('Error seeding mock authorities:', error);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Seed default authorities
    await seedAuthorities();
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
