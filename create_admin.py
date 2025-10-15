#!/usr/bin/env python3
"""
Script to create an admin user for the Terminal Archives application.
Run this script to add a new admin user to the database.
"""

import database
import getpass

def main():
    print("=== Terminal Archives - Create Admin User ===")
    print()
    
    # Initialize database if it doesn't exist
    database.init_db()
    
    username = input("Enter username: ").strip()
    if not username:
        print("Username cannot be empty!")
        return
    
    password = getpass.getpass("Enter password: ")
    if not password:
        print("Password cannot be empty!")
        return
    
    password_confirm = getpass.getpass("Confirm password: ")
    if password != password_confirm:
        print("Passwords do not match!")
        return
    
    # Add the user
    database.add_user(username, password)
    print("\nAdmin user setup complete!")

if __name__ == '__main__':
    main()
