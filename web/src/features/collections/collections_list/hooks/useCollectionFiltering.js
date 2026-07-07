import { useState, useMemo, useEffect } from "react";
import { getBooksByLanguage } from "@/data/books";

const useCollectionFiltering = (language) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [showCollectionFilter, setShowCollectionFilter] = useState(false);
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load books based on language
  useEffect(() => {
    setIsLoading(true);
    const booksData = getBooksByLanguage(language);
    setBooks(booksData);
    setIsLoading(false);
  }, [language]);

  // Get all unique collections from all books
  const allCollections = useMemo(() => {
    const collections = new Set();
    books.forEach((book) => {
      if (book.collection) {
        const bookCollections = Array.isArray(book.collection)
          ? book.collection
          : [book.collection];
        bookCollections.forEach((collection) => collections.add(collection));
      }
    });
    return Array.from(collections).sort();
  }, [books]);

  // Helper function to get collections as array
  const getCollectionsAsArray = (collection) => {
    if (!collection) return [];
    return Array.isArray(collection) ? collection : [collection];
  };

  // Group books by collection - now properly handling multiple collections per book
  const collections = useMemo(() => {
    const collectionsObj = books.reduce((acc, book) => {
      if (book.collection) {
        const bookCollections = getCollectionsAsArray(book.collection);

        bookCollections.forEach((collectionName) => {
          if (!acc[collectionName]) {
            acc[collectionName] = [];
          }
          if (!acc[collectionName].some((b) => b.id === book.id)) {
            acc[collectionName].push(book);
          }
        });
      }
      return acc;
    }, {});

    // Filter collections based on search term and selected collections
    const filteredCollections = {};

    Object.entries(collectionsObj).forEach(
      ([collectionName, collectionBooks]) => {
        const collectionMatchesSearch =
          searchTerm === "" ||
          collectionName.toLowerCase().includes(searchTerm.toLowerCase());

        const collectionMatchesFilter =
          selectedCollections.length === 0 ||
          selectedCollections.includes(collectionName);

        const filteredBooks = collectionBooks.filter((book) => {
          const bookMatchesSearch =
            searchTerm === "" ||
            book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (book.description &&
              book.description
                .toLowerCase()
                .includes(searchTerm.toLowerCase())) ||
            collectionName.toLowerCase().includes(searchTerm.toLowerCase());

          return bookMatchesSearch;
        });

        if (
          collectionMatchesFilter &&
          (filteredBooks.length > 0 || collectionMatchesSearch)
        ) {
          filteredCollections[collectionName] = filteredBooks;
        }
      },
    );

    return filteredCollections;
  }, [books, searchTerm, selectedCollections]);

  const handleCollectionToggle = (collection) => {
    setSelectedCollections((prev) =>
      prev.includes(collection)
        ? prev.filter((c) => c !== collection)
        : [...prev, collection],
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCollections([]);
  };

  const toggleCollectionFilter = () => {
    setShowCollectionFilter((prev) => !prev);
  };

  return {
    books,
    collections,
    allCollections,
    searchTerm,
    setSearchTerm,
    selectedCollections,
    setSelectedCollections,
    showCollectionFilter,
    setShowCollectionFilter,
    handleCollectionToggle,
    clearFilters,
    toggleCollectionFilter,
    isLoading,
  };
};

export default useCollectionFiltering;