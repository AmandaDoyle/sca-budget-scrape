#!/bin/bash

# make sure we are at the top of the git directory
REPOLOC="$(git rev-parse --show-toplevel)"
cd $REPOLOC

# download the sca plan
curl 'https://dnnhh5cc1.blob.core.windows.net/portals/0/Capital_Plan/Capital_plans/11162017_15_19_CapitalPlan.pdf?sr=b&si=DNNFileManagerPolicy&sig=6ZUDr4YoMGig5oWw5%2F%2BCYdMy8CV09qjwltkO3KZ0QkU%3D' -o ./sca-scrape/downloads/sca_plan.pdf

# scrape
for script in $(ls $REPOLOC/data_scraping/sca-scrape/ | grep 'script_')
do
    node $REPOLOC/sca-scrape/$script
done

# append all outputs into one csv
python $REPOLOC/sca-scrape/merge_csvs.py

cd $REPOLOC

