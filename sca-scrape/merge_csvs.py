'''
Merge the output csvs into one
'''

import pandas as pd
import subprocess
import os
import glob
import re
from itertools import compress

# make sure we are at the top of the repo
wd = subprocess.check_output('git rev-parse --show-toplevel', shell = True)
os.chdir(wd[:-1]) #-1 removes \n

# read in the csvs
#output = pd.concat((pd.read_csv(f) for f in glob.glob('data_scraping/sca-scrape/output_*')))

# read in the csvs in a way that won't break with bad scraping
# list all files for iteration
files = glob.glob('data_scraping/sca-scrape/output_*')

# remove location files
files = list(compress(files, ['Locations' not in f for f in files]))

# put together the projects
output = pd.DataFrame()
for f in files:
    cols = pd.read_csv(f,nrows = 1)
    new = pd.read_csv(f, usecols = list(cols))
    new['source'] = re.sub('([a-z])([A-Z])', '\g<1> \g<2>', f[32:-4])
    output = pd.concat((output, new))

# add site location data back in
prk_site = pd.read_csv('data_scraping/sca-scrape/output_PreKSiteLocations.csv')
cap_site = pd.read_csv('data_scraping/sca-scrape/output_CapacitySiteLocations.csv')

loc = pd.concat((prk_site, cap_site))

output = pd.merge(output, loc[['school_name','location']], how = 'left', on = 'school_name')

# some further cleaning

# make borough consistant
output.loc[output['borough'] == 'Q','borough'] = 'Queens'
output.loc[output['borough'] == 'M','borough'] = 'Manhattan'
output.loc[output['borough'] == 'X','borough'] = 'Bronx'
output.loc[output['borough'] == 'K','borough'] = 'Brooklyn'
output.loc[output['borough'] == 'R','borough'] = 'Staten Island'

# fix units: millions --> dollars
mils = ['funding_reqd_fy15-19',
        'needed_to_complete',
        'previous_appropriations',
        'total_est_cost']

for m in mils:
    output.loc[:,m] = output.loc[:,m] * 10e6

# write to csv 
output.to_csv('data_scraping/sca-scrape/auto_output.csv')




