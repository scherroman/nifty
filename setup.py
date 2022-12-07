from setuptools import find_packages, setup

test_requirements = ["solc-select==1.0.2", "slither-analyzer==0.9.1"]

setup(
    name="nifty",
    packages=find_packages(),
    extras_require={"tests": test_requirements},
)
