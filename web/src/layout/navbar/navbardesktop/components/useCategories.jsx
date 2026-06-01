// src/hooks/useCategories.js
import { useMemo, useState, useEffect } from "react";
// Adjust the import path to match your actual data file location.
// If you use the @ alias pointing to src/, this works:

/**
 * Converts a country name to a URL slug.
 */
const toSlug = (name) => name.toLowerCase().replace(/\s+/g, "-");

export const useCategories = () => {
  const [countries, setCountries] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countriesRes, categoriesRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/meta/countries`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/meta/categories`)
        ]);
        
        const countriesData = await countriesRes.json();
        const categoriesData = await categoriesRes.json();
        
        setCountries(countriesData.sort());
        setDbCategories(categoriesData);
      } catch (e) { console.error("Failed to load dynamic categories", e); }
    };
    fetchData();
  }, []);

  const countryCategory = useMemo(() => {
    return {
      id: "country",
      title: "Books by Country",
      items: countries.map((name) => ({
        name,
        path: `/books/country/${toSlug(name)}`, // adjust pattern if needed
      })),
      viewAllPath: "/books/by-country",
    };
  }, [countries]);

  const categories = useMemo(() => {
    // Combine country data with dynamic category groupings from DB
    return [countryCategory, ...dbCategories];
  }, [countryCategory, dbCategories]);

  return categories;
};