// <copyright file="QueryStringParserTest.cs" company="IHS">
// © 2016, IHS Inc. and its affiliated and subsidiary companies, all rights reserved.
// All other trademarks are the property of IHS Inc. and its affiliated and subsidiary
// companies.
// This product, including software, data and documentation are licensed to the user 
// for its internal business purposes only and may not be disclosed, disseminated, 
// sold, licensed, copied, reproduced, translated or transferred to any third party.
// IHS Inc. 
// 15 Inverness Way East 
// Englewood, Colorado 80112
// USA 
// +1 303-736-3000
// </copyright>
namespace IHS.Apps.CMP.Test.Utilities.Parsers
{
    using System.Diagnostics.CodeAnalysis;

    using IHS.Apps.CMP.DataProviders;
    using IHS.Apps.CMP.DataProviders.Model;
    using IHS.Apps.CMP.Utilities.URLParsers;
    using IHS.Core.Catalog.Model;
    using IHS.Core.Catalog.Model.Search;

    using Microsoft.VisualStudio.TestTools.UnitTesting;

    using Moq;

    /// <summary>
    /// Test Cases against the QueryString Parser
    /// </summary>
    [TestClass]
    public class QueryStringParserTest
    {
        /// <summary>
        /// Checks that the parser identifies that it can parse the content 
        /// if it contains the correct parameter e.g. the q parameter
        /// </summary>
        [TestMethod]
        [SuppressMessage("StyleCop.CSharp.DocumentationRules", "SA1650:ElementDocumentationMustBeSpelledCorrectly", 
            Justification = "Reviewed. Suppression is OK here.")]
        public void TestCanProcess_ValidArgs()
        {
            var parser = new QueryStringParser(new ParserConfigObject());
            Assert.IsTrue(parser.CanProcess("?ssddd=12345&q=0"));
            Assert.IsTrue(parser.CanProcess("?ssddd=12345&q=birds"));
            Assert.IsTrue(parser.CanProcess("?ssddd=12345&q=&num=0"));
        }

        /// <summary>
        /// Checks that the parser identifies that it can parse the content 
        /// if it contains the correct parameters e.g.
        /// num or pg
        /// </summary>
        [TestMethod]
        [SuppressMessage("StyleCop.CSharp.DocumentationRules", "SA1650:ElementDocumentationMustBeSpelledCorrectly", 
            Justification = "Reviewed. Suppression is OK here.")]
        public void TestCanProcess_InvalidArgs()
        {
            var parser = new QueryStringParser(new ParserConfigObject());
            Assert.IsFalse(parser.CanProcess("?ssddd=12345&blagh=0"));
            Assert.IsFalse(parser.CanProcess("?ssddd=12345&nmb=5"));
        }

        /// <summary>The test simple parse.</summary>
        [TestMethod]
        public void TestSimpleQuerySimpleSearch()
        {
            var search = SetUpSearch();

            var qsp = new QueryStringParser(new ParserConfigObject() { CurrentProvider = DataProviderManager.GetProvider("JanesFast") });
            qsp.Parse("Apache", search);
            Assert.IsTrue(search.Constraints.Count == 1);
        }

        /// <summary>The test simple parse.
        /// Should generate query that's represented by:
        /// apple
        /// NOT
        ///     OR
        ///         Phrase: pear
        ///         Phrase: plum"
        /// </summary>
        [TestMethod]
        public void TestComplexQuerySimpleSearch()
        {
            var search = SetUpSearch();

            var qsp = new QueryStringParser(new ParserConfigObject() { CurrentProvider = DataProviderManager.GetProvider("JanesFast") });
            qsp.Parse("apple<not>(pear<or>plum)", search);

            var mainConstraint = search.Constraints[0] as AndNestedConstraint;
            Assert.IsTrue(mainConstraint.Count == 2);

            var notConstraint = mainConstraint[1] as NotConstraint;
            Assert.IsTrue(notConstraint.Constraint is OrNestedConstraint);

            var orNestedConstraint = notConstraint.Constraint as OrNestedConstraint;
            Assert.AreEqual((orNestedConstraint[1] as SearchBehaviorConstraint).SearchTextValue, "plum");
        }

        /// <summary>Tests the simple query in advanced search.</summary>
        [TestMethod]
        public void TestSimpleQueryAdvancedSearch()
        {
            var search = SetUpSearch();

            var qsp = new QueryStringParser(new ParserConfigObject() { CurrentProvider = DataProviderManager.GetProvider("JanesFast") });
            qsp.Parse("[apple]<or>[plum]", search);

            var mainConstraint = search.Constraints[0] as OrNestedConstraint;
            Assert.IsTrue(mainConstraint.Count == 2);

            var constraint = mainConstraint[1] as SearchBehaviorConstraint;
            Assert.AreEqual("plum", constraint.SearchTextValue);
        }

        /// <summary>Tests advanced search containing complex query.
        /// Should generate query that's represented by:
        /// OR 
        ///     apple
        ///     plum
        ///     NOT
        ///         AND
        ///             Phrase: banana
        ///             Phrase: kiwi
        /// </summary>
        [TestMethod]
        public void TestComplexQueryAdvancedSearch()
        {
            var search = SetUpSearch();

            var qsp = new QueryStringParser(new ParserConfigObject() { CurrentProvider = DataProviderManager.GetProvider("JanesFast") });
            qsp.Parse("[apple]<or>[plum<not>(banana<and>kiwi)]", search);

            var mainConstraint = search.Constraints[0] as OrNestedConstraint;
            Assert.IsTrue(mainConstraint.Count == 2);

            var andNested = mainConstraint[1] as AndNestedConstraint;
            var notConstraint = andNested[1] as NotConstraint;
            var secondAndNested = notConstraint.Constraint as AndNestedConstraint;
            var value = (secondAndNested[1] as SearchBehaviorConstraint).SearchTextValue;

            Assert.AreEqual("kiwi", value);
        }

        /// <summary>Tests the advanced search mixed 'title' and 'full text' indexers.</summary>
        [TestMethod]
        public void TestAdvancedSearchMixedIndexers()
        {
            var search = SetUpSearch();
            var qsp = new QueryStringParser(new ParserConfigObject() { CurrentProvider = DataProviderManager.GetProvider("JanesFast") });
            qsp.Parse("[apple]<or>[title(banana)]", search);

            var mainConstraint = search.Constraints[0] as OrNestedConstraint;
            Assert.IsTrue(mainConstraint.Count == 2);

            var constr = mainConstraint[1] as IndexedSearchBehaviorConstraint;
            Assert.AreEqual("title", constr.Indexer.ObjectKey);
            Assert.AreEqual("banana", (constr.Constraint as SearchBehaviorConstraint).SearchTextValue);
        }

        /// <summary>Tests the not query advanced search.</summary>
        [TestMethod]
        public void TestNotQueryAdvancedSearch()
        {
            var search = SetUpSearch();
            var qsp = new QueryStringParser(new ParserConfigObject() { CurrentProvider = DataProviderManager.GetProvider("JanesFast") });
            qsp.Parse("[title(apple)]<or>[plum]<not>[title(banana)]", search);

            var mainConstraint = search.Constraints[0] as OrNestedConstraint;
            Assert.IsTrue(mainConstraint.Count == 2);

            var andNested = mainConstraint[1] as AndNestedConstraint;
            var notConstraint = andNested[1] as NotConstraint;
            var indexedConstraint = notConstraint.Constraint as IndexedSearchBehaviorConstraint;

            var value = (indexedConstraint.Constraint as SearchBehaviorConstraint).SearchTextValue;

            Assert.AreEqual("banana", value);
        }


        /// <summary>Tests the not query advanced search.</summary>
        [TestMethod]
        public void TestFilterColumnsQueryAdvancedSearch()
        {
            //Arrange
            var search = SetUpSearch();
            var qsp = new QueryStringParser(new ParserConfigObject() { CurrentProvider = DataProviderManager.GetProvider("JanesFast") });
            qsp.Parse("[ViewItemDescription|ViewPlatformFamily|ViewItemName|ViewSourcesData(Jumbotrom-99)]", search);
          
            var mainConstraint = search.Constraints[0] as AndNestedConstraint;
            Assert.IsTrue(mainConstraint.Count == 1);

            var orNestedConstraint = mainConstraint[0] as OrNestedConstraint;
            Assert.IsTrue(orNestedConstraint.Count == 4);

            var indexedConstraint = orNestedConstraint[0] as IndexedSearchBehaviorConstraint;
           
            var value = (indexedConstraint.Constraint as SearchBehaviorConstraint).SearchTextValue;

            Assert.AreEqual("Jumbotrom-99", value);
        }

        [TestMethod]
        public void TestFilterFullTextQueryAdvancedSearch()
        {
            //Arrange
            var search = SetUpSearch();
            var qsp = new QueryStringParser(new ParserConfigObject() { CurrentProvider = DataProviderManager.GetProvider("JanesFast") });
            qsp.Parse("[FullText(Mock-33)]", search);

            var mainConstraint = search.Constraints[0] as AndNestedConstraint;
            Assert.IsTrue(mainConstraint.Count == 1);

            var andNestedConstraint = mainConstraint[0] as AndNestedConstraint;

            var value = (andNestedConstraint[0] as SearchBehaviorConstraint).SearchTextValue;

            Assert.AreEqual("Mock-33", value);
        }


        [TestMethod]
        public void TestFilterFullTextWithCollumnsQueryAdvancedSearch()
        {
            //Arrange
            var search = SetUpSearch();
            var qsp = new QueryStringParser(new ParserConfigObject() { CurrentProvider = DataProviderManager.GetProvider("JanesFast") });
            qsp.Parse("[FullText(Mock-33)]<and>[ViewItemDescription|ViewPlatformFamily|ViewItemName|ViewSourcesData(Jumbotrom-99)]", search);
            var mainConstraint = search.Constraints[0] as AndNestedConstraint;
            Assert.IsTrue(mainConstraint.Count == 1);

            var andNestedConstraint = mainConstraint[0] as AndNestedConstraint;

            var value = (andNestedConstraint[0] as SearchBehaviorConstraint).SearchTextValue;

            Assert.AreEqual("Mock-33", value);
        }

        /// <summary>
        /// Sets up the search object
        /// </summary>
        /// <returns>The search with mock properties</returns>
        private static Search SetUpSearch()
        {
            var category = new Mock<ICategory>();
            var search = new Search
                         {
                             SearchSource = new CategorySource(category.Object)
                         };
            var indexers = new ReadOnlyIndexerList(
                new CommonIndexerList<IIndexer>
                {
                    new ProviderAttribute("attributeId", "attributeName", AttributeType.STRING_TYPE, null), 
                    new ProviderAttribute("title", "title", AttributeType.STRING_TYPE, null)
                });

            category.Setup(x => x.Indexers).Returns(indexers);
            category.Setup(p => p.Domain.ObjectKey).Returns("JANESFASTDOMAIN");
            return search;
        }
    }
}