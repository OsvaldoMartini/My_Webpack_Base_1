<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
								xmlns:janes="http://dtd.janes.com/2002/Content/"
								xmlns:dc="http://purl.org/dc/elements/1.1/"
								xmlns:xlink="http://www.w3.org/1999/xlink"
								xmlns:jm="http://dtd.janes.com/2005/metadata/"
								exclude-result-prefixes = "janes dc xlink jm">

  <xsl:output encoding="UTF-8" indent="yes" method="html" omit-xml-declaration="yes" />

  <xsl:param name="imagebase">/ExternalItems/Janes/images/</xsl:param>
  <xsl:param name="nonimagebase">/ExternalItems/Janes/images/</xsl:param>
  <xsl:param name="section"></xsl:param>
  <xsl:param name="showSidebox">true</xsl:param>
  <xsl:param name="showTitle">true</xsl:param>
  <xsl:param name="isParentSpecification">false</xsl:param>

  <xsl:key name="cfields" match="//janes:fdGroup" use="concat(../../../../janes:fdLabel/text(),../../../../janes:conditions/text(),../../../../@groupOrder,../../../janes:fdLabel/text(),../../../janes:conditions/text(),../../../@groupOrder, ../../janes:fdLabel/text(),../../janes:conditions/text(),../../@groupOrder, ../janes:fdLabel/text(),../janes:conditions/text(), ../@groupOrder, janes:fdLabel/text(),janes:conditions/text(), @groupOrder, '-lvl', count(ancestor::janes:fdGroup), '-' , string(janes:fdValue/janes:value[@pos][1]/@pos), 'tableno', count(ancestor::janes:fieldedData/preceding-sibling::janes:fieldedData) + 1, 'col', count(ancestor::janes:fd_equipment/preceding-sibling::janes:fd_equipment) + 1)" />
  <xsl:key name="fields" match="//janes:fdGroup" use="concat(../../../../janes:fdLabel/text(),../../../../janes:conditions/text(),../../../../@groupOrder,../../../janes:fdLabel/text(),../../../janes:conditions/text(),../../../@groupOrder, ../../janes:fdLabel/text(),../../janes:conditions/text(),../../@groupOrder, ../janes:fdLabel/text(),../janes:conditions/text(), ../@groupOrder, janes:fdLabel/text(),janes:conditions/text(), @groupOrder, '-lvl', count(ancestor::janes:fdGroup), '-' , string(janes:fdValue/janes:value[@pos][1]/@pos), 'tableno', count(ancestor::janes:fieldedData/preceding-sibling::janes:fieldedData) + 1)" />
  <xsl:key name="shipInstances" match="//janes:fleetList/janes:shipInstance/*" use="local-name()" />

  <xsl:variable name="imagebs">
    <xsl:value-of select="$imagebase" />
    <xsl:if test="substring($imagebase, string-length($imagebase)) != '/'">
      <xsl:text>/</xsl:text>
    </xsl:if>
  </xsl:variable>
  <xsl:variable name="nimagebs">
    <xsl:value-of select="$nonimagebase" />
    <xsl:if test="substring($nonimagebase, string-length($nonimagebase)) != '/'">
      <xsl:text>/</xsl:text>
    </xsl:if>
  </xsl:variable>

  <xsl:variable name="meta" select="janes:record/janes:metadata" />
  <xsl:variable name="metaSubject" select="$meta/dc:subject" />
  <xsl:variable name="pbt" select="$meta/jm:classification[@taxonomy='productBrowseTree']/jm:standardName" />
  <xsl:variable name="date" select='$meta/dc:date[@qualifier="postDate"]' />
  <xsl:variable name="year" select="substring($date, 1, 4)" />
  <xsl:variable name="day" select="substring($date, 7, 2)" />
  <xsl:variable name="title" select="janes:record/janes:title[1]" />
  <xsl:variable name="topThumbCount" select="4" />
  <xsl:variable name="month">
    <xsl:call-template name="numbertoThreeLetterName">
      <xsl:with-param name="monthNum">
        <xsl:value-of select="substring($date, 5, 2)" />
      </xsl:with-param>
    </xsl:call-template>
  </xsl:variable>

  <xsl:variable name="n">
    <xsl:text></xsl:text>
  </xsl:variable>

  <xsl:variable name="pubabbrev" select="janes:record/@pubabbrev" />

  <xsl:variable name="typeflag">
    <xsl:choose>
      <xsl:when test='
							janes:record/@pubabbrev="FREP" or
							janes:record/@pubabbrev="IDR" or
							janes:record/@pubabbrev="IWR" or
							janes:record/@pubabbrev="JAR" or
							janes:record/@pubabbrev="JDIN" or
							janes:record/@pubabbrev="JDW" or
							janes:record/@pubabbrev="JIAA" or
							janes:record/@pubabbrev="JID" or
							janes:record/@pubabbrev="JIR" or
							janes:record/@pubabbrev="JIWK" or
							janes:record/@pubabbrev="JMR" or
							janes:record/@pubabbrev="JNI" or
							janes:record/@pubabbrev="JTF" or
							janes:record/@pubabbrev="JTSM" or
							janes:record/@pubabbrev="RJHM" or
							janes:record/@pubabbrev="TWR" or
							janes:record/@pubabbrev="IWR" or
							janes:record/@pubabbrev="SMITJ" or
							(janes:record/@pubabbrev="JCBRN" and contains(janes:record/@id, "jcbrn")) or

							(normalize-space(/janes:record/janes:metadata/dc:subject[@qualifier="publication"][1]) = "Jane&apos;s Terrorism and Insurgency Centre"
											and not(janes:record/@pubabbrev="JTIR"))

							'>
        <xsl:value-of select="'News'" />
      </xsl:when>
      <xsl:when test='
							janes:record/@pubabbrev="USC" or
							janes:record/@pubabbrev="FEA" or
							janes:record/@pubabbrev="MEA" or
							janes:record/@pubabbrev="EUR" or
							janes:record/@pubabbrev="CLA"
						'>
        <xsl:value-of select="'JAHA'" />
      </xsl:when>
      <xsl:when test='janes:record/@pubabbrev="JDEI"'>
        <xsl:value-of select="'Images'" />
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="'Reference'" />
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <xsl:template match="/">

    <xsl:if test="$isParentSpecification = 'true'" >
      <div class="alert alert-info">The specification displayed is its parent specification</div>
    </xsl:if>

    <xsl:apply-templates select="//janes:fieldedData" />

    <xsl:apply-templates select="//janes:table[@qualifier='specifications']" />

  </xsl:template>

  <xsl:template match="janes:sect1[janes:title/@qualifier='rating']">
    <div class="u-overflow-hidden">
      <h2>
        <xsl:value-of select="janes:title"/>
      </h2>
      <xsl:choose>
        <xsl:when test="contains($pubabbrev,'CBRN')">
          <xsl:apply-templates select="janes:table" mode="CBRNrating">
            <xsl:with-param name="caption" select="janes:title" />
          </xsl:apply-templates>
        </xsl:when>
        <xsl:otherwise>
          <xsl:apply-templates select="janes:table">
            <xsl:with-param name="caption" select="janes:title" />
          </xsl:apply-templates>
        </xsl:otherwise>
      </xsl:choose>
    </div>
  </xsl:template>

  <xsl:template match="janes:table" mode="CBRNrating">
    <xsl:param name="caption"></xsl:param>
    <table class="table table-bordered width-80">
      <caption class="sr-only">$caption</caption>
      <tr class="text-center">
        <xsl:for-each select="janes:tgroup[1]/janes:tbody[1]/janes:row[1]/janes:entry">
          <td>
            <xsl:attribute name="class">
              <xsl:text>blockCBRNLabel</xsl:text>
              <xsl:value-of select="normalize-space(translate(.,'.','_'))" />
            </xsl:attribute>
            <xsl:apply-templates />
          </td>
        </xsl:for-each>
      </tr>
      <tr class="text-center">
        <xsl:for-each select="janes:tgroup[1]/janes:tbody[1]/janes:row[2]/janes:entry">
          <td>
            <xsl:call-template name="ActiveRatingCBRN">
              <xsl:with-param name="posit" select="position()" />
            </xsl:call-template>
            <xsl:apply-templates />
          </td>
        </xsl:for-each>
      </tr>
    </table>
  </xsl:template>

  <xsl:template name="ActiveRatingCBRN">
    <xsl:param name="posit" />
    <xsl:choose>
      <xsl:when test="../../janes:row[1]/janes:entry[$posit][janes:para/janes:render/@appearance='bold']">
        <xsl:attribute name="class">
          <xsl:text>active</xsl:text>
        </xsl:attribute>
        <span class="visible-print">
          <xsl:value-of select="concat(../../janes:row[1]/janes:entry[$posit][janes:para/janes:render/@appearance='bold'], ': ')" />
        </span>
      </xsl:when>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="janes:record/janes:metadata/dc:creator">
    <xsl:if test="position() &gt; 1">
      <xsl:text>; </xsl:text>
    </xsl:if>
    <xsl:apply-templates />
  </xsl:template>

  <xsl:template name="makeSection">
    <xsl:param name="level" select="'sect1'" />

    <xsl:variable name="disptype">
      <xsl:choose>
        <xsl:when test="@display = 'inline'">
          <xsl:value-of select="'inline'" />
        </xsl:when>
        <xsl:when test="@display = 'block'">
          <xsl:value-of select="'block'" />
        </xsl:when>
        <!-- for now, default is block -->
        <xsl:otherwise>
          <xsl:value-of select="'block'" />
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:choose>
      <xsl:when test="@qualifier = 'keyPoints'">
        <div class="panel panel-default u-overflow-hidden">
          <xsl:if test="janes:title">
            <div class="panel-heading">
              <xsl:apply-templates select="janes:title" mode="plain" />
            </div>
          </xsl:if>
          <div class="panel-body">
            <xsl:apply-templates select="*[ not(name() = 'janes:metadata') and not(name() = 'janes:title')]" />
          </div>
        </div>
      </xsl:when>
      <xsl:when test="janes:title='Summary' and $disptype='inline'">
        <div class="panel panel-default u-overflow-hidden">
          <xsl:if test="janes:title">
            <div class="panel-heading">
              <xsl:apply-templates select="janes:title" mode="plain" />
            </div>
          </xsl:if>
          <div class="panel-body">
            <xsl:apply-templates select="*[ not(name() = 'janes:metadata') and not(name() = 'janes:title')]" />
          </div>
        </div>
      </xsl:when>
      <xsl:when test="janes:title='Summary' and janes:sect2/@qualifier='box' and $level = 'sect1'">
        <div class="panel panel-default u-overflow-hidden">
          <xsl:if test="janes:title">
            <div class="panel-heading">
              <xsl:apply-templates select="janes:title" mode="plain" />
            </div>
          </xsl:if>
          <table class="table table-bordered">
            <xsl:if test="janes:title">
              <caption class="sr-only">
                <xsl:apply-templates select="janes:title" mode="very_plain" />
              </caption>
            </xsl:if>
            <xsl:for-each select="janes:sect2">
              <xsl:for-each select="janes:sect3">
                <tr>
                  <td>
                    <p>
                      <xsl:apply-templates select="janes:title" mode="plain" />
                    </p>
                  </td>
                  <td>
                    <xsl:apply-templates select="janes:list" />
                    <xsl:apply-templates select="janes:para" />
                  </td>
                </tr>
              </xsl:for-each>
            </xsl:for-each>
          </table>
        </div>
      </xsl:when>
      <xsl:when test="@qualifier = 'box' or @qualifier = 'event'">
        <div>
          <xsl:choose>
            <xsl:when test="janes:title and not(janes:title = 'Key Points') and not(@qualifier = 'event') and count(preceding::janes:sect1) > 0">
              <xsl:attribute name="class">panel panel-default u-overflow-hidden text-flow-none</xsl:attribute>
            </xsl:when>
            <xsl:otherwise>
              <xsl:attribute name="class">panel panel-default u-overflow-hidden</xsl:attribute>
            </xsl:otherwise>
          </xsl:choose>

          <xsl:if test="janes:title">
            <div class="panel-heading">
              <xsl:apply-templates select="janes:title" mode="plain" />
            </div>
          </xsl:if>
          <table class="table table-bordered">
            <xsl:if test="janes:title">
              <caption class="sr-only">
                <xsl:apply-templates select="janes:title" mode="very_plain" />
              </caption>
            </xsl:if>
            <xsl:choose>
              <xsl:when test="janes:title and not(janes:title = '')">
                <tr>
                  <td>
                    <xsl:apply-templates select="*[ not(name() = 'janes:title') ]" />
                  </td>
                </tr>
              </xsl:when>
              <xsl:otherwise>
                <tr>
                  <td>
                    <xsl:apply-templates />
                  </td>
                </tr>
              </xsl:otherwise>
            </xsl:choose>
          </table>
        </div>
      </xsl:when>
      <xsl:when test="@qualifier = 'breakout'">
        <div class="panel panel-default u-overflow-hidden">
          <div>
            <xsl:apply-templates select="*[not(name() = 'janes:authoredBy')]" />
          </div>
          <xsl:if test="not(janes:authoredBy/janes:author/janes:authorName='')">
            <div>
              <xsl:apply-templates select="janes:authoredBy" />
            </div>
          </xsl:if>
        </div>
      </xsl:when>

      <xsl:otherwise>
        <div>
          <xsl:apply-templates select="*[ not(name() = 'janes:metadata') ]" />
        </div>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="janes:sect1|janes:sect2|janes:sect3|janes:sectN">

    <xsl:call-template name="makeSection">
      <xsl:with-param name="level" select="local-name()" />
    </xsl:call-template>
  </xsl:template>

  <!-- Fielded Data -->

  <xsl:template match="janes:fieldedData">

    <xsl:variable name="extraclass">
      <xsl:if test="@updated='y' or ancestor::*[@updated='y']">
        <xsl:text> green1</xsl:text>
      </xsl:if>
    </xsl:variable>

    <div class="panel panel-default u-overflow-hidden">
      <xsl:element name="table">
        <xsl:attribute name="class">
          <xsl:text>table table-bordered</xsl:text>
          <xsl:value-of select="$extraclass" />
        </xsl:attribute>

        <xsl:element name="tr">
          <xsl:attribute name="class">active moduleTitle text-center</xsl:attribute>
          <xsl:element name="td" />
          <xsl:for-each select="janes:fd_equipment">
            <xsl:element name="td">
              <xsl:element name="div">
                <xsl:for-each select="janes:name">
                  <xsl:if test="position() &gt; 1">
                    <xsl:text>, </xsl:text>
                  </xsl:if>
                  <xsl:value-of select="." />
                </xsl:for-each>
              </xsl:element>
            </xsl:element>
          </xsl:for-each>
        </xsl:element>

        <!-- iterate through groups defined by keys -->
        <xsl:call-template name="buildSpecGroup">
          <xsl:with-param name="tableNum" select="count(preceding::janes:fieldedData) + 1" />
          <xsl:with-param name="topHeader" select="''" />
          <xsl:with-param name="level" select="1" />
        </xsl:call-template>
      </xsl:element>
    </div>
    <!-- END HTML creation -->
  </xsl:template>

  <xsl:template name="buildSpecGroup">

    <xsl:param name="tableNum" select="1" />
    <xsl:param name="topHeader" select="''" />
    <xsl:param name="level" select="1" />

    <xsl:for-each select="//janes:fieldedData[position() = $tableNum]//janes:fdGroup[count(. | key('fields', concat(../../../../janes:fdLabel/text(),../../../../janes:conditions/text(),../../../../@groupOrder,../../../janes:fdLabel/text(),../../../janes:conditions/text(),../../../@groupOrder, ../../janes:fdLabel/text(),../../janes:conditions/text(),../../@groupOrder, ../janes:fdLabel/text(),../janes:conditions/text(), ../@groupOrder, janes:fdLabel/text(),janes:conditions/text(), @groupOrder, '-lvl', count(ancestor::janes:fdGroup), '-' , string(janes:fdValue/janes:value[@pos][1]/@pos), 'tableno', $tableNum))[1]) = 1]">
      <!-- remove rows where descendant janes:values contain only 'unknown' or 'not applicable' -->
      <xsl:if test="key('fields', concat(../../../../janes:fdLabel/text(),../../../../janes:conditions/text(),../../../../@groupOrder,../../../janes:fdLabel/text(),../../../janes:conditions/text(),../../../@groupOrder, ../../janes:fdLabel/text(),../../janes:conditions/text(),../../@groupOrder, ../janes:fdLabel/text(),../janes:conditions/text(), ../@groupOrder, janes:fdLabel/text(),janes:conditions/text(), @groupOrder, '-lvl', count(ancestor::janes:fdGroup), '-' , string(janes:fdValue/janes:value[@pos][1]/@pos), 'tableno', $tableNum))//janes:value[not(contains(@qualifier,'connector'))][not(@status = 'unknown') and not(@status = 'notApplicable')][not(preceding-sibling::janes:value[1]/@qualifier = 'connector_ratio' and preceding-sibling::janes:value[2][@status = 'unknown' or @status = 'notApplicable'])][not(following-sibling::janes:value[1]/@qualifier = 'connector_ratio' and following-sibling::janes:value[2][@status = 'unknown' or @status =  'notApplicable'])]">

        <!-- Remove rows with no label -->
        <xsl:if test="normalize-space(janes:fdLabel) != ''">
          <!-- Remove rows if under a narrative (not inc generated narrative for air) -->
          <xsl:if test="not(ancestor::janes:fdGroup/janes:fdGroup/janes:fdValue/janes:narrative[not(@generated) or @generated != 'y'])">
            <!--
				<xsl:element name="tr">
					<xsl:element name="td">
						<xsl:value-of select="$topHeader" /> <xsl:text> - </xsl:text> <xsl:value-of select="$level" />
					</xsl:element>
				</xsl:element>
				-->
            <xsl:if test="count(ancestor::janes:fdGroup) = $level - 1">
              <xsl:if test="starts-with(concat(../../../../janes:fdLabel/text(),../../../../janes:conditions/text(),../../../../@groupOrder,../../../janes:fdLabel/text(),../../../janes:conditions/text(),../../../@groupOrder, ../../janes:fdLabel/text(),../../janes:conditions/text(),../../@groupOrder, ../janes:fdLabel/text(),../janes:conditions/text(), ../@groupOrder, janes:fdLabel/text()), $topHeader)">

                <xsl:choose>
                  <xsl:when test="not(janes:fdLabel = 'Grouped conditions')">

                    <xsl:element name="tr">
                      <xsl:if test="$level = 1">
                        <xsl:attribute name="class">info</xsl:attribute>
                      </xsl:if>
                      <xsl:call-template name="buildHeading" />
                      <xsl:call-template name="buildrow">
                        <xsl:with-param name="label">
                          <xsl:value-of select="concat(../../../../janes:fdLabel/text(),../../../../janes:conditions/text(),../../../../@groupOrder,../../../janes:fdLabel/text(),../../../janes:conditions/text(),../../../@groupOrder, ../../janes:fdLabel/text(),../../janes:conditions/text(),../../@groupOrder, ../janes:fdLabel/text(),../janes:conditions/text(), ../@groupOrder, janes:fdLabel/text(), @groupOrder, '-lvl', count(ancestor::janes:fdGroup), '-' , string(janes:fdValue/janes:value[@pos][1]/@pos))" />
                        </xsl:with-param>
                        <xsl:with-param name="cols">
                          <xsl:value-of select="count(ancestor::janes:fieldedData//janes:fd_equipment)" />
                        </xsl:with-param>
                        <xsl:with-param name="currentcol" select="1" />
                        <xsl:with-param name="tableNum" select="$tableNum" />
                      </xsl:call-template>
                    </xsl:element>

                    <xsl:if test="$level = 1 and janes:fdGroup/janes:fdValue/janes:narrative">

                      <xsl:element name="tr">

                        <xsl:element name="td">
                          <xsl:attribute name="id">
                            <xsl:value-of select="concat ('fdLabel', 2)" />
                          </xsl:attribute>
                          <xsl:value-of select="janes:fdLabel" />
                          <xsl:choose>
                            <xsl:when test="contains(substring(@label, string-length(@label) - 1), ':')" />
                            <xsl:otherwise>
                              <xsl:text>:</xsl:text>
                            </xsl:otherwise>
                          </xsl:choose>
                        </xsl:element>

                        <xsl:call-template name="buildrow">

                          <xsl:with-param name="label">
                            <xsl:value-of select="concat(../../../../janes:fdLabel/text(),../../../../janes:conditions/text(),../../../../@groupOrder,../../../janes:fdLabel/text(),../../../janes:conditions/text(),../../../@groupOrder, ../../janes:fdLabel/text(),../../janes:conditions/text(),../../@groupOrder, ../janes:fdLabel/text(),../janes:conditions/text(), ../@groupOrder, janes:fdLabel/text(), @groupOrder, '-lvl', count(ancestor::janes:fdGroup), '-' , string(janes:fdValue/janes:value[@pos][1]/@pos))" />
                          </xsl:with-param>
                          <xsl:with-param name="cols">
                            <xsl:value-of select="count(ancestor::janes:fieldedData//janes:fd_equipment)" />
                          </xsl:with-param>
                          <xsl:with-param name="currentcol" select="1" />
                          <xsl:with-param name="forcevalue" select="1" />
                          <xsl:with-param name="tableNum" select="$tableNum" />
                        </xsl:call-template>
                      </xsl:element>
                    </xsl:if>

                    <xsl:if test="janes:fdGroup">
                      <xsl:call-template name="buildSpecGroup">

                        <xsl:with-param name="topHeader" select="concat($topHeader, janes:fdLabel, janes:conditions, @groupOrder)" />
                        <xsl:with-param name="level" select="$level + 1" />
                        <xsl:with-param name="tableNum" select="$tableNum" />
                      </xsl:call-template>
                    </xsl:if>
                  </xsl:when>
                  <xsl:when test="janes:fdLabel = 'Grouped conditions' and parent::janes:fd">

                    <xsl:value-of select="$n" />
                    <xsl:element name="tr">

                      <xsl:element name="td">
                        <xsl:text>&#160;&#160;&#160;</xsl:text>
                      </xsl:element>

                      <xsl:call-template name="buildrow">

                        <xsl:with-param name="label">
                          <xsl:value-of select="concat(../../../../janes:fdLabel/text(),../../../../janes:conditions/text(),../../../../@groupOrder,../../../janes:fdLabel/text(),../../../janes:conditions/text(),../../../@groupOrder, ../../janes:fdLabel/text(),../../janes:conditions/text(),../../@groupOrder, ../janes:fdLabel/text(),../janes:conditions/text(), ../@groupOrder, janes:fdLabel/text(), @groupOrder, '-lvl', count(ancestor::janes:fdGroup), '-' , string(janes:fdValue/janes:value[@pos][1]/@pos))" />
                        </xsl:with-param>
                        <xsl:with-param name="cols">
                          <xsl:value-of select="count(ancestor::janes:fieldedData//janes:fd_equipment)" />
                        </xsl:with-param>
                        <xsl:with-param name="currentcol" select="1" />
                        <xsl:with-param name="forcevalue" select="2" />
                        <xsl:with-param name="tableNum" select="$tableNum" />
                      </xsl:call-template>
                    </xsl:element>
                  </xsl:when>
                  <xsl:otherwise />
                </xsl:choose>
              </xsl:if>
            </xsl:if>
          </xsl:if>
        </xsl:if>
      </xsl:if>
    </xsl:for-each>
  </xsl:template>

  <xsl:template name="buildHeading">
    <xsl:element name="td">
      <xsl:choose>
        <xsl:when test="count(ancestor-or-self::janes:fdGroup) = 1">
          <xsl:attribute name="class">moduleTitle</xsl:attribute>
        </xsl:when>
        <xsl:when test="count(ancestor-or-self::janes:fdGroup) = 2">
          <xsl:attribute name="class">u-font-125 bold</xsl:attribute>
        </xsl:when>
      </xsl:choose>

      <xsl:value-of select="janes:fdLabel" />
      <xsl:if test="janes:conditions">
        <xsl:text> - </xsl:text>
        <xsl:apply-templates select="janes:conditions" />
      </xsl:if>
      <xsl:choose>
        <!-- Just in case label already ends in colon-->
        <xsl:when test="contains(substring(@label, string-length(@label) - 1), ':')" />
        <!-- not lowest level, but every other level -->
        <xsl:when test="janes:fdGroup/janes:fdValue/janes:narrative and not(janes:fdLabel/@level = '1')">:</xsl:when>
        <xsl:when test="janes:fdGroup"></xsl:when>
        <xsl:otherwise>
          <xsl:text>:</xsl:text>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:element>
  </xsl:template>

  <xsl:template name="buildrow">
    <xsl:param name="label" />
    <xsl:param name="cols" />
    <xsl:param name="currentcol" />
    <xsl:param name="forcevalue" />
    <xsl:param name="tableNum" select="1" />

    <xsl:choose>
      <xsl:when test="key('cfields', concat(../../../../janes:fdLabel/text(),../../../../janes:conditions/text(),../../../../@groupOrder,../../../janes:fdLabel/text(),../../../janes:conditions/text(),../../../@groupOrder, ../../janes:fdLabel/text(),../../janes:conditions/text(),../../@groupOrder, ../janes:fdLabel/text(),../janes:conditions/text(), ../@groupOrder, janes:fdLabel/text(),janes:conditions/text(), @groupOrder, '-lvl', count(ancestor::janes:fdGroup), '-' , string(janes:fdValue/janes:value[@pos][1]/@pos), 'tableno', $tableNum, 'col', $currentcol))">

        <xsl:element name="td">
          <xsl:choose>
            <xsl:when test="$forcevalue = 1">
              <xsl:if test = "key('cfields', concat(../../../../janes:fdLabel/text(),../../../../janes:conditions/text(),../../../../@groupOrder,../../../janes:fdLabel/text(),../../../janes:conditions/text(),../../../@groupOrder, ../../janes:fdLabel/text(),../../janes:conditions/text(),../../@groupOrder, ../janes:fdLabel/text(),../janes:conditions/text(), ../@groupOrder, janes:fdLabel/text(),janes:conditions/text(), @groupOrder, '-lvl', count(ancestor::janes:fdGroup), '-' , string(janes:fdValue/janes:value[@pos][1]/@pos), 'tableno', $tableNum, 'col', $currentcol))/janes:fdGroup[janes:fdValue/janes:narrative]//@updated = 'y'">
                <xsl:attribute name="class">green1</xsl:attribute>
              </xsl:if>
            </xsl:when>
            <xsl:otherwise>
              <xsl:if test="key('cfields', concat(../../../../janes:fdLabel/text(),../../../../janes:conditions/text(),../../../../@groupOrder,../../../janes:fdLabel/text(),../../../janes:conditions/text(),../../../@groupOrder, ../../janes:fdLabel/text(),../../janes:conditions/text(),../../@groupOrder, ../janes:fdLabel/text(),../janes:conditions/text(), ../@groupOrder, janes:fdLabel/text(),janes:conditions/text(), @groupOrder, '-lvl', count(ancestor::janes:fdGroup), '-' , string(janes:fdValue/janes:value[@pos][1]/@pos), 'tableno', $tableNum, 'col', $currentcol))//@updated = 'y'">
                <xsl:attribute name="class">green1</xsl:attribute>
              </xsl:if>
            </xsl:otherwise>
          </xsl:choose>
          <xsl:for-each select="key('cfields', concat(../../../../janes:fdLabel/text(),../../../../janes:conditions/text(),../../../../@groupOrder,../../../janes:fdLabel/text(),../../../janes:conditions/text(),../../../@groupOrder, ../../janes:fdLabel/text(),../../janes:conditions/text(),../../@groupOrder, ../janes:fdLabel/text(),../janes:conditions/text(), ../@groupOrder, janes:fdLabel/text(),janes:conditions/text(), @groupOrder, '-lvl', count(ancestor::janes:fdGroup), '-' , string(janes:fdValue/janes:value[@pos][1]/@pos), 'tableno', $tableNum, 'col', $currentcol))">
            <xsl:choose>

              <xsl:when test="$forcevalue = 1">

                <xsl:apply-templates select="janes:fdGroup/janes:fdValue[janes:narrative]" />
                <xsl:if test="position() != last()">
                  <xsl:element name="br" />
                </xsl:if>
              </xsl:when>

              <xsl:when test="$forcevalue = 2">
                <xsl:apply-templates select="janes:fdGroup[janes:fdLabel = '']/janes:fdValue" />
                <xsl:if test="position() != last()">
                  <xsl:element name="br" />
                </xsl:if>
              </xsl:when>

              <xsl:when test="janes:fdGroup/janes:fdValue/janes:narrative[@generated='y']">
                <xsl:apply-templates select="janes:fdGroup/janes:fdValue[janes:narrative[@generated='y']]" />
                <xsl:if test="position() != last()">
                  <xsl:element name="br" />
                </xsl:if>
              </xsl:when>

              <xsl:when test="janes:fdGroup/janes:fdValue/janes:narrative and not(janes:fdLabel/@level = '1')">

                <xsl:apply-templates select="janes:fdGroup/janes:fdValue[janes:narrative]" />
                <xsl:if test="position() != last()">
                  <xsl:element name="br" />
                </xsl:if>
              </xsl:when>

              <xsl:when test="janes:fdGroup/janes:fdLabel = 'Grouped conditions'">

                <xsl:element name="span">
                  <xsl:attribute name="class">detailsHead</xsl:attribute>
                  <xsl:apply-templates select="janes:fdGroup[janes:fdLabel = 'Grouped conditions']/janes:fdGroup[not(.//janes:narrative)]/janes:fdValue" />
                  <xsl:if test="position() != last()">
                    <xsl:element name="br" />
                  </xsl:if>
                </xsl:element>
              </xsl:when>
              <xsl:when test="janes:fdValue">

                <xsl:apply-templates select="janes:fdValue" />
                <xsl:if test="position() != last()">
                  <xsl:element name="br" />
                </xsl:if>
              </xsl:when>
              <xsl:otherwise>
                <xsl:text>&#160;</xsl:text>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:for-each>
        </xsl:element>
      </xsl:when>
      <xsl:otherwise>
        <xsl:element name="td">
          <xsl:text>&#160;</xsl:text>
        </xsl:element>
      </xsl:otherwise>
    </xsl:choose>

    <xsl:if test="$currentcol &lt; $cols">

      <xsl:call-template name="buildrow">

        <xsl:with-param name="label">
          <xsl:value-of select="$label" />
        </xsl:with-param>
        <xsl:with-param name="cols">
          <xsl:value-of select="$cols" />
        </xsl:with-param>
        <xsl:with-param name="currentcol" select="$currentcol + 1" />
        <xsl:with-param name="tableNum" select="$tableNum" />
      </xsl:call-template>
    </xsl:if>
  </xsl:template>

  <!-- HTML creation templates -->
  <xsl:template match="janes:fd">
    <xsl:apply-templates />
  </xsl:template>

  <xsl:template match="janes:br">

    <xsl:element name="br" />
  </xsl:template>

  <xsl:template match="janes:narrative">
    <xsl:if test="preceding-sibling::janes:narrative">
      <xsl:element name="br" />
    </xsl:if>
    <xsl:apply-templates />
  </xsl:template>

  <xsl:template match="janes:narrative[@generated='y']">
    <xsl:if test="preceding-sibling::janes:narrative[@generated='y']">
      <xsl:element name="br" />
    </xsl:if>
    <xsl:choose>
      <xsl:when test="janes:nText">
        <xsl:for-each select="janes:nText">
          <xsl:if test="preceding-sibling::janes:nText">
            <br />
          </xsl:if>
          <xsl:apply-templates select="." />
          <xsl:apply-templates select="../janes:nTitle" />
        </xsl:for-each>
      </xsl:when>
      <xsl:otherwise>
        <xsl:apply-templates select="janes:nTitle" />
      </xsl:otherwise>
    </xsl:choose>
    <xsl:if test="janes:narrative">
      <br />
    </xsl:if>
    <xsl:apply-templates select="janes:narrative" />
  </xsl:template>

  <xsl:template match="janes:narrative[@generated='y']/janes:nText">
    <xsl:apply-templates />
  </xsl:template>

  <xsl:template match="janes:narrative[@generated = 'y']/janes:nTitle">
    <xsl:choose>
      <xsl:when test="text() != '' and ../janes:nText[text() != '']">
        <xsl:text> [</xsl:text>
        <xsl:apply-templates />
        <xsl:text>] </xsl:text>
      </xsl:when>
      <xsl:otherwise>
        <xsl:apply-templates />
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="janes:nText">
    <xsl:apply-templates />
  </xsl:template>

  <xsl:template match="janes:nTitle">
    <b>
      <xsl:apply-templates />
    </b>
    <xsl:text>&#160;</xsl:text>
  </xsl:template>

  <xsl:template match="janes:fdValue">
    <xsl:choose>

      <xsl:when test="janes:narrative">
        <xsl:apply-templates />
      </xsl:when>

      <!-- Turn unknown ratios into unknown (only do of form unknown:1, 1:unknown)-->
      <xsl:when test=".//janes:value[@qualifier = 'connector_ratio'][count(preceding-sibling::janes:value) = 1][count(following-sibling::janes:value) = 1][../janes:value/@status = 'unknown']">
        <xsl:text>unknown</xsl:text>
      </xsl:when>
      <xsl:when test=".//janes:value[@qualifier = 'connector_ratio'][count(preceding-sibling::janes:value) = 1][count(following-sibling::janes:value) = 1][../janes:value/@status = 'notApplicable']">
        <xsl:text>n/a</xsl:text>
      </xsl:when>

      <!-- ACTUAL DATA VALUE PROCESSING -->
      <!-- Process only fdValue where there is a value that isn't unknown or not applicable-->
      <xsl:when test=".//janes:value[not(contains(@qualifier,'connector'))][not(@status = 'unknown' or @status = 'notApplicable')]">
        <xsl:apply-templates />
        <xsl:if test="not(janes:appli) and ancestor::janes:fdGroup/janes:appli">
          <xsl:apply-templates select="(ancestor::janes:fdGroup/janes:appli)[1]" />
        </xsl:if>
      </xsl:when>

      <xsl:when test="janes:value[not(contains(@qualifier,'connector'))][@status = 'unknown' or @status = 'notApplicable'] and (janes:appli or ancestor::janes:fdGroup/janes:appli)">
      </xsl:when>

      <!-- All unknowns or not applicable -->
      <!-- if any of the fdValues without values contains unknown, put "unknown"-->
      <xsl:when test=".//janes:value[not(contains(@qualifier,'connector'))][@status = 'unknown']">
        <xsl:text>unknown</xsl:text>
      </xsl:when>
      <!-- if any of the fdValues without values and without unknown contains notApplicable, put "not applicable"-->
      <xsl:when test=".//janes:value[not(contains(@qualifier,'connector'))][@status = 'notApplicable']">
        <xsl:text>n/a</xsl:text>
      </xsl:when>

      <!-- REALLY Shouldn't happen - indicates an untrapped to_ouput problem -->
      <xsl:when test="@error" />

      <!-- otherwise put unknown. This should not ever occur -->
      <xsl:otherwise>
        <xsl:text> unknown </xsl:text>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="janes:appli">
    <xsl:if test="not(preceding-sibling::janes:value[1][@status = 'unknown' or @status = 'notApplicable'])">
      <xsl:if test="count(janes:insRef) != count(//janes:shipInstance)">
        <xsl:if test="janes:insRef[not(. = '')]">

          <xsl:text> (</xsl:text>
          <xsl:call-template name="chompVariants">
            <xsl:with-param name="string">
              <xsl:for-each select="janes:insRef">
                <!-- TMP - may be needed -->
                <xsl:sort select="." order="ascending" />
                <xsl:choose>
                  <xsl:when test=". = ''">
                    <xsl:message>Warning: insRef has no text!</xsl:message>
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:text>|</xsl:text>
                    <xsl:value-of select="." />
                    <xsl:text>|</xsl:text>
                  </xsl:otherwise>
                </xsl:choose>
              </xsl:for-each>
            </xsl:with-param>
          </xsl:call-template>
          <xsl:text>) </xsl:text>
        </xsl:if>
      </xsl:if>
    </xsl:if>

    <!--<xsl:if test="parent::janes:fdGroup/following-sibling::janes:fdGroup/janes:value[not(@status = 'unknown' or @status = 'notApplicable')]">-->
    <xsl:if test="parent::janes:fdValue/following-sibling::janes:fdValue/janes:value[not(@status = 'unknown' or @status = 'notApplicable')]">
      <xsl:element name="br" />
    </xsl:if>
  </xsl:template>

  <xsl:template match="janes:value">

    <xsl:if test="@alpha and @alpha != ''">
      <xsl:if test="preceding-sibling::janes:value">
        <br />
      </xsl:if>
      <b>
        <xsl:value-of select="@alpha" />:
      </b>
    </xsl:if>

    <xsl:choose>

      <!-- New connector rules from PP -->

      <!-- remove connector from start and end, and use the first if two would end up together -->

      <xsl:when test="contains(@qualifier,'connector')">

        <xsl:choose>
          <xsl:when test="ancestor::janes:fdGroup[1]/janes:fdLabel/text() = 'Tyres'">
            <xsl:if test="(preceding-sibling::*[descendant-or-self::janes:value[not(@status = 'unknown' or @status = 'notApplicable')]]) and
							(not(contains(following-sibling::*[descendant-or-self::janes:value[not(@status = 'unknown' or @status = 'notApplicable')]][1]//@qualifier, 'connector'))) and
							(following-sibling::*[descendant-or-self::janes:value[not(contains(@qualifier, 'connector'))][not(@status = 'unknown' or @status = 'notApplicable')]])">
              <xsl:apply-templates />
              <xsl:if test="following-sibling::*[descendant-or-self::janes:appli]">
                <xsl:element name="br" />
              </xsl:if>
            </xsl:if>
          </xsl:when>
          <xsl:otherwise>
            <xsl:if test="(preceding-sibling::*[descendant-or-self::janes:value[not(@status = 'unknown' or @status = 'notApplicable')]]) and
							(not(contains(preceding-sibling::*[descendant-or-self::janes:value[not(@status = 'unknown' or @status = 'notApplicable')]][1]//@qualifier, 'connector'))) and
							(following-sibling::*[descendant-or-self::janes:value[not(contains(@qualifier, 'connector'))][not(@status = 'unknown' or @status = 'notApplicable')]])">
              <xsl:apply-templates />
              <xsl:if test="following-sibling::*[descendant-or-self::janes:appli]">
                <xsl:element name="br" />
              </xsl:if>
            </xsl:if>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:when>

      <!-- Value rules. -->
      <xsl:otherwise>
        <xsl:choose>
          <!-- New rules from PP -->
          <!-- always remove unknowns. Since unknown is now a status, this is the same as doing nothing -->
          <xsl:when test="@status = 'unknown'" />
          <!-- always remove not applicable also (previously these were left in) -->
          <xsl:when test="@status = 'notApplicable'" />
          <!-- Remove Secondary/Main from Armament -->
          <xsl:when test="@fdLabel = 'role' and (text() = 'main' or text()='secondary')" />
          <xsl:otherwise>
            <!-- converted values in brackets -->
            <xsl:if test="@source = 'converted'">(</xsl:if>
            <xsl:apply-templates />
            <xsl:if test="@gentext">
              <!-- At the moment always putting space before gentext. This may change -->
              <!--<xsl:text>&#160;</xsl:text>-->
              <xsl:call-template name="tidygentext">
                <xsl:with-param name="string" select="@gentext" />
              </xsl:call-template>
            </xsl:if>

            <!-- estimated value + close ) for converted. Combined because est. will be different -->
            <xsl:choose>
              <xsl:when test="@source = 'converted' and @status = 'estimated'">
                <xsl:text> est.)</xsl:text>
              </xsl:when>
              <xsl:when test="@source = 'converted'">
                <xsl:text>)</xsl:text>
              </xsl:when>
              <xsl:when test="@status = 'estimated'">
                <xsl:text> (est.)</xsl:text>
              </xsl:when>
              <xsl:otherwise />
            </xsl:choose>

            <!-- spaces only for lists without connectors. This may change -->
            <xsl:choose>
              <xsl:when test="following-sibling::*[descendant-or-self::janes:value[not(@status = 'unknown' or @status = 'notApplicable')]][1][not(contains(@qualifier,'connector'))]">
                <xsl:text>&#160;</xsl:text>
              </xsl:when>

              <xsl:when test="@source = 'converted' and parent::janes:fdValue/following-sibling::*[descendant-or-self::janes:value[not(@status = 'unknown' or @status = 'notApplicable')]][1][not(contains(@qualifier,'connector'))][not(janes:appli)]">
                <xsl:text>&#160;</xsl:text>
              </xsl:when>
            </xsl:choose>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="janes:conditions">
    <xsl:text> (</xsl:text>
    <xsl:apply-templates />
    <xsl:text>)</xsl:text>
  </xsl:template>

  <xsl:template name="tidygentext">

    <xsl:param name="string" />

    <xsl:if test="not($string = '' or $string = ' ')">

      <xsl:choose>
        <xsl:when test="normalize-space($string) = '%'">
          <xsl:text>%</xsl:text>
        </xsl:when>
        <xsl:when test="normalize-space($string) = '&#xb0;'">
          <xsl:text>&#xb0;</xsl:text>
        </xsl:when>
        <!-- added by CP 20/04/2010 -->
        <xsl:when test="normalize-space($string) = '&#xb0;/s'">
          <xsl:text>&#xb0;/s</xsl:text>
        </xsl:when>
        <xsl:otherwise>
          <xsl:text>&#160;</xsl:text>
          <xsl:value-of select="normalize-space($string)" />
        </xsl:otherwise>
      </xsl:choose>
    </xsl:if>
  </xsl:template>

  <xsl:template name="chompVariants">
    <xsl:param name="string" />

    <xsl:variable name="firstvariant" select="substring-before(substring-after($string, '|'), '|')" />
    <xsl:variable name="prefix">
      <xsl:call-template name="chompPrefix">
        <xsl:with-param name="string" select="$firstvariant" />
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="firstvalue">
      <xsl:choose>
        <xsl:when test="$prefix = 'NO PREFIX'">
          <xsl:value-of select="$firstvariant" />
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="substring-after($firstvariant, $prefix)" />
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <!--<xsl:text>FV: </xsl:text><xsl:value-of select="$firstvalue" />-->

    <xsl:choose>

      <xsl:when test="$prefix = ''" />

      <xsl:when test="$firstvalue = ''">

        <xsl:call-template name="chompWholeWords">
          <xsl:with-param name="string" select="substring-after($string, concat('|', $firstvariant, '|'))" />
          <xsl:with-param name="prefix" select="$prefix" />
          <xsl:with-param name="firstvalue" select="$firstvariant" />
          <xsl:with-param name="lastvalue" select="$firstvariant" />
        </xsl:call-template>

        <xsl:variable name="remnant">
          <xsl:call-template name="returnVariantBlock">
            <xsl:with-param name="string" select="$string" />
            <xsl:with-param name="prefix" select="$prefix" />
            <xsl:with-param name="mode" select="'words'" />
          </xsl:call-template>
        </xsl:variable>

        <xsl:if test="$remnant != ''">
          <xsl:text>, </xsl:text>
          <xsl:call-template name="chompVariants">
            <xsl:with-param name="string" select="$remnant" />
          </xsl:call-template>
        </xsl:if>
      </xsl:when>
      <xsl:otherwise>

        <xsl:if test="$prefix != 'NO PREFIX'">
          <xsl:value-of select="$prefix" />
          <xsl:text> </xsl:text>
        </xsl:if>

        <xsl:call-template name="chompVariantBlock">
          <xsl:with-param name="string" select="substring-after($string, concat('|', $firstvariant, '|'))" />
          <xsl:with-param name="prefix" select="$prefix" />
          <xsl:with-param name="firstvalue" select="$firstvalue" />
          <xsl:with-param name="lastvalue" select="number($firstvalue)" />
        </xsl:call-template>

        <xsl:variable name="remnant">
          <xsl:call-template name="returnVariantBlock">
            <xsl:with-param name="string" select="$string" />
            <xsl:with-param name="prefix" select="$prefix" />
            <xsl:with-param name="mode" select="'pennant'" />
          </xsl:call-template>
        </xsl:variable>

        <xsl:if test="$remnant != ''">
          <xsl:text>, </xsl:text>
          <xsl:call-template name="chompVariants">
            <xsl:with-param name="string" select="$remnant" />
          </xsl:call-template>
        </xsl:if>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="chompPrefix">
    <xsl:param name="string" />
    <xsl:choose>
      <xsl:when test="translate($string, '0123456789', '') = ''">
        <xsl:text>NO PREFIX</xsl:text>
      </xsl:when>
      <xsl:when test="
		substring($string, string-length($string)) = '0' or
		substring($string, string-length($string)) = '1' or
		substring($string, string-length($string)) = '2' or
		substring($string, string-length($string)) = '3' or
		substring($string, string-length($string)) = '4' or
		substring($string, string-length($string)) = '5' or
		substring($string, string-length($string)) = '6' or
		substring($string, string-length($string)) = '7' or
		substring($string, string-length($string)) = '8' or
		substring($string, string-length($string)) = '9'">
        <xsl:call-template name="chompPrefix">
          <xsl:with-param name="string">
            <xsl:value-of select="substring($string, 0, string-length($string) - 1)" />
          </xsl:with-param>
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$string" />
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="chompWholeWords">
    <xsl:param name="string" />
    <xsl:param name="prefix" />
    <xsl:param name="firstvalue" />
    <xsl:param name="lastvalue" />

    <xsl:variable name="nextvariant" select="substring-before(substring-after($string, '|'), '|')" />
    <xsl:variable name="nextprefix">
      <xsl:call-template name="chompPrefix">
        <xsl:with-param name="string" select="$nextvariant" />
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="nextvalue" select="substring-after($nextvariant, $nextprefix)" />

    <xsl:choose>
      <xsl:when test="$string = '' ">
        <!-- tidy up -->
        <xsl:value-of select="$lastvalue" />
      </xsl:when>

      <xsl:when test="$nextvariant = ''">
        <xsl:call-template name="chompWholeWords">
          <xsl:with-param name="string" select="substring-after($string, concat('|', $nextvariant, '|'))" />
          <xsl:with-param name="prefix" select="$prefix" />
          <xsl:with-param name="firstvalue" select="$firstvalue" />
          <xsl:with-param name="lastvalue" select="$lastvalue" />
        </xsl:call-template>
      </xsl:when>

      <xsl:when test="$nextvalue != ''">
        <!-- tidy up -->
        <xsl:value-of select="$lastvalue" />
      </xsl:when>
      <xsl:when test="$lastvalue = ''">
        <!-- no name for appli, keep going but do not write -->
        <xsl:call-template name="chompWholeWords">
          <xsl:with-param name="string" select="substring-after($string, concat('|', $nextvariant, '|'))" />
          <xsl:with-param name="prefix" select="$prefix" />
          <xsl:with-param name="firstvalue" select="$firstvalue" />
          <xsl:with-param name="lastvalue" select="$nextvariant" />
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$lastvalue" />
        <xsl:text>, </xsl:text>
        <xsl:call-template name="chompWholeWords">
          <xsl:with-param name="string" select="substring-after($string, concat('|', $nextvariant, '|'))" />
          <xsl:with-param name="prefix" select="$prefix" />
          <xsl:with-param name="firstvalue" select="$firstvalue" />
          <xsl:with-param name="lastvalue" select="$nextvariant" />
        </xsl:call-template>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="chompVariantBlock">
    <xsl:param name="string" />
    <xsl:param name="prefix" />
    <xsl:param name="firstvalue" />
    <xsl:param name="lastvalue" />

    <xsl:variable name="nextwantedvalue" select="$lastvalue + 1" />
    <xsl:variable name="nextvariant" select="substring-before(substring-after($string, '|'), '|')" />

    <xsl:variable name="nextprefix">
      <xsl:call-template name="chompPrefix">
        <xsl:with-param name="string" select="$nextvariant" />
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="nextvalue">
      <xsl:choose>
        <xsl:when test="$prefix = 'NO PREFIX'">
          <xsl:value-of select="$nextvariant" />
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="number(substring-after($nextvariant, $prefix))" />
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:choose>
      <xsl:when test="$string = '' ">
        <!-- tidy up -->
        <xsl:choose>
          <xsl:when test="number($firstvalue) = number($lastvalue)">
            <xsl:value-of select="$firstvalue" />
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="$firstvalue" />
            <xsl:text>-</xsl:text>
            <xsl:value-of select="$lastvalue" />
          </xsl:otherwise>
        </xsl:choose>
      </xsl:when>

      <xsl:when test="$nextvariant = ''">
        <xsl:call-template name="chompVariantBlock">
          <xsl:with-param name="string" select="substring-after($string, concat('|', $nextvariant, '|'))" />
          <xsl:with-param name="prefix" select="$prefix" />
          <xsl:with-param name="firstvalue" select="$firstvalue" />
          <xsl:with-param name="lastvalue" select="$lastvalue" />
        </xsl:call-template>
      </xsl:when>

      <xsl:when test="$nextvariant = $nextprefix">
        <xsl:choose>
          <xsl:when test="number($firstvalue) = number($lastvalue)">
            <xsl:value-of select="$firstvalue" />
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="$firstvalue" />
            <xsl:text>-</xsl:text>
            <xsl:value-of select="$lastvalue" />
          </xsl:otherwise>
        </xsl:choose>
      </xsl:when>
      <xsl:when test="$nextprefix != $prefix">
        <!-- tidy up -->
        <xsl:choose>
          <xsl:when test="number($firstvalue) = number($lastvalue)">
            <xsl:value-of select="$firstvalue" />
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="$firstvalue" />
            <xsl:text>-</xsl:text>
            <xsl:value-of select="$lastvalue" />
          </xsl:otherwise>
        </xsl:choose>
      </xsl:when>
      <xsl:when test="$nextvalue != $nextwantedvalue">
        <xsl:choose>
          <xsl:when test="number($firstvalue) = number($lastvalue)">
            <xsl:value-of select="$firstvalue" />
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="$firstvalue" />
            <xsl:text>-</xsl:text>
            <xsl:value-of select="$lastvalue" />
          </xsl:otherwise>
        </xsl:choose>
        <xsl:text>,</xsl:text>
        <xsl:call-template name="chompVariantBlock">
          <xsl:with-param name="string" select="substring-after($string, concat('|', $nextvariant, '|'))" />
          <xsl:with-param name="prefix" select="$prefix" />
          <xsl:with-param name="firstvalue" select="$nextvalue" />
          <xsl:with-param name="lastvalue" select="$nextvalue" />
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:call-template name="chompVariantBlock">
          <xsl:with-param name="string" select="substring-after($string, concat('|', $nextvariant, '|'))" />
          <xsl:with-param name="prefix" select="$prefix" />
          <xsl:with-param name="firstvalue" select="$firstvalue" />
          <xsl:with-param name="lastvalue" select="$nextvalue" />
        </xsl:call-template>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="returnVariantBlock">
    <xsl:param name="string" />
    <xsl:param name="prefix" />
    <xsl:param name="mode" />

    <xsl:variable name="nextvariant" select="substring-before(substring-after($string, '|'), '|')" />
    <xsl:variable name="nextprefix">
      <xsl:call-template name="chompPrefix">
        <xsl:with-param name="string" select="$nextvariant" />
      </xsl:call-template>
    </xsl:variable>

    <xsl:choose>
      <xsl:when test="$mode = 'pennant'">
        <xsl:choose>
          <xsl:when test="$string = ''" />
          <xsl:when test="$nextvariant = ''">
            <xsl:call-template name="returnVariantBlock">
              <xsl:with-param name="string" select="substring-after($string, concat('|', $nextvariant, '|'))" />
              <xsl:with-param name="prefix" select="$prefix" />
              <xsl:with-param name="mode" select="'pennant'" />
            </xsl:call-template>
          </xsl:when>
          <xsl:when test="$nextprefix != $prefix">
            <xsl:value-of select="$string" />
          </xsl:when>
          <xsl:otherwise>
            <xsl:call-template name="returnVariantBlock">
              <xsl:with-param name="string" select="substring-after($string, concat('|', $nextvariant, '|'))" />
              <xsl:with-param name="prefix" select="$prefix" />
              <xsl:with-param name="mode" select="'pennant'" />
            </xsl:call-template>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:when>
      <xsl:when test="$mode = 'words'">
        <xsl:choose>
          <xsl:when test="$string = ''" />
          <xsl:when test="$nextvariant = ''">
            <xsl:call-template name="returnVariantBlock">
              <xsl:with-param name="string" select="substring-after($string, concat('|', $nextvariant, '|'))" />
              <xsl:with-param name="prefix" select="$prefix" />
              <xsl:with-param name="mode" select="'words'" />
            </xsl:call-template>
          </xsl:when>
          <xsl:when test="$nextprefix != $nextvariant">
            <xsl:value-of select="$string" />
          </xsl:when>
          <xsl:otherwise>
            <xsl:call-template name="returnVariantBlock">
              <xsl:with-param name="string" select="substring-after($string, concat('|', $nextvariant, '|'))" />
              <xsl:with-param name="prefix" select="$prefix" />
              <xsl:with-param name="mode" select="'words'" />
            </xsl:call-template>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:when>
      <xsl:otherwise>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- Fleetlist -->

  <xsl:template match="janes:fleetList">

    <xsl:choose>
      <xsl:when test=".//janes:shipInstance//janes:shipName/janes:Name[. != ''] or  .//janes:shipInstance//janes:shipNumber/janes:pennant[. != '']">

        <xsl:variable name="outofservice">
          <xsl:choose>
            <xsl:when test="//janes:shipInstance//janes:outOfService[@label and not(@label = '')]">
              <xsl:value-of select="1"/>
            </xsl:when>
            <xsl:otherwise>
              <xsl:value-of select="0"/>
            </xsl:otherwise>
          </xsl:choose>
        </xsl:variable>

        <div class="u-overflow-hidden">
          <table class="table table-bordered">

            <tr>
              <xsl:for-each select="janes:shipInstance[1]/*[@label and not(@label = '')][not(local-name() = 'outOfService')]">

                <xsl:if test="key('shipInstances', local-name())//*[text() and not(translate(text(), ' ', '') = '')]">
                  <th>

                    <xsl:value-of select="@label" />
                  </th>
                </xsl:if>
              </xsl:for-each>

              <xsl:if test="$outofservice = 1">
                <th>
                  <xsl:value-of select="//janes:shipInstance//janes:outOfService[@label and not(@label = '')][1]/@label"/>
                </th>
              </xsl:if>
            </tr>
            <xsl:value-of select="$n" />

            <xsl:for-each select="janes:shipInstance[.//janes:shipName/janes:Name[. != ''] or .//janes:shipNumber/janes:pennant[. != '']]">
              <tr>

                <xsl:for-each select="*[@label and not(@label = '')][not(local-name() = 'outOfService')]">

                  <xsl:if test="key('shipInstances', local-name())//*[text() and not(translate(text(), ' ', '') = '')]">
                    <td>

                      <xsl:apply-templates select="." />
                    </td>
                  </xsl:if>
                </xsl:for-each>

                <xsl:if test="$outofservice = 1">
                  <xsl:choose>
                    <xsl:when test="janes:outOfService">
                      <td>
                        <xsl:apply-templates select="janes:outOfService"/>
                      </td>
                    </xsl:when>
                    <xsl:otherwise>
                      <td/>
                    </xsl:otherwise>
                  </xsl:choose>
                </xsl:if>

              </tr>
              <xsl:value-of select="$n" />
            </xsl:for-each>
          </table>
        </div>
      </xsl:when>
      <xsl:otherwise>
        <div class="u-overflow-hidden alert alert-info" role="alert">This information is unavailable.</div>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="janes:shipInstance/*">
    <xsl:apply-templates />
  </xsl:template>

  <!-- for (ex-ABC 123, ex-DEF 345)-->
  <xsl:template match="janes:shipInstance//janes:exShipName|janes:shipInstance//janes:exPennant">
    <xsl:if test="preceding-sibling::* and (local-name(preceding-sibling::*[1]) != local-name())">
      <xsl:text> (</xsl:text>
    </xsl:if>
    <xsl:if test="preceding-sibling::* and (local-name(preceding-sibling::*[1]) = local-name())">
      <xsl:text>, </xsl:text>
    </xsl:if>
    <xsl:text>ex-</xsl:text>
    <xsl:apply-templates />
    <xsl:if test="not(following-sibling::*) or (local-name(following-sibling::*[1]) != local-name())">
      <xsl:text>)</xsl:text>
    </xsl:if>
  </xsl:template>

  <!-- for (thing 1, thing 2)-->
  <xsl:template match="janes:shipInstance//janes:typeNo|janes:shipInstance//janes:shipNameAlias">
    <xsl:if test="preceding-sibling::* and (local-name(preceding-sibling::*[1]) != local-name())">
      <xsl:text> (</xsl:text>
    </xsl:if>
    <xsl:if test="preceding-sibling::* and (local-name(preceding-sibling::*[1]) = local-name())">
      <xsl:text>, </xsl:text>
    </xsl:if>
    <xsl:apply-templates />
    <xsl:if test="not(following-sibling::*) or (local-name(following-sibling::*[1]) != local-name())">
      <xsl:text>)</xsl:text>
    </xsl:if>
  </xsl:template>

  <!-- for AA/PA, (Builder 1 group)/(Builder 2 group) -->
  <xsl:template match="janes:shipInstance//janes:builder">
    <xsl:if test="preceding-sibling::*[not(@status = 'unknown')]">
      <xsl:text>/</xsl:text>
    </xsl:if>
    <xsl:apply-templates />
  </xsl:template>

  <xsl:template match="janes:shipInstance//janes:fs">
    <xsl:if test="preceding-sibling::*[text() and not(text() = '')]">
      <xsl:text>/</xsl:text>
    </xsl:if>
    <xsl:apply-templates />
  </xsl:template>

  <!-- For Builder Group = Name, Town. If no Name, do not put in comma-->
  <xsl:template match="janes:shipInstance//janes:builder/janes:builderTown">
    <xsl:if test="preceding-sibling::*[1][local-name() = 'Name'][text() and not(text() = '')]">
      <xsl:text>, </xsl:text>
    </xsl:if>
    <xsl:apply-templates />
  </xsl:template>

  <!-- Comma between seaport and admin area -->
  <xsl:template match="janes:shipInstance//janes:adminArea">
    <xsl:if test="preceding-sibling::*[1][local-name() = 'seaPort'][text() and not(text() = '')]">
      <xsl:text>, </xsl:text>
    </xsl:if>
    <xsl:apply-templates />
  </xsl:template>

  <!-- Do not display these -->
  <xsl:template match="janes:shipInstance//janes:builderRegion|janes:shipInstance//janes:builderCountry|janes:shipInstance//janes:LRNO" />

  <xsl:template match="janes:shipInstance//janes:outOfServiceReason">
    <xsl:text> (</xsl:text>
    <xsl:apply-templates/>
    <xsl:text>)</xsl:text>
  </xsl:template>


  <!-- Just apply templates -->
  <xsl:template match="janes:shipInstance//janes:Name|janes:shipInstance//janes:seaPort">
    <xsl:apply-templates />
  </xsl:template>

  <!-- Transform dates (XSLT 1 compliant version -->

  <xsl:template name="monthtext">
    <xsl:param name="input" />
    <xsl:choose>
      <xsl:when test="$input = 1">Jan</xsl:when>
      <xsl:when test="$input = 2">Feb</xsl:when>
      <xsl:when test="$input = 3">Mar</xsl:when>
      <xsl:when test="$input = 4">Apr</xsl:when>
      <xsl:when test="$input = 5">May</xsl:when>
      <xsl:when test="$input = 6">Jun</xsl:when>
      <xsl:when test="$input = 7">Jul</xsl:when>
      <xsl:when test="$input = 8">Aug</xsl:when>
      <xsl:when test="$input = 9">Sep</xsl:when>
      <xsl:when test="$input = 10">Oct</xsl:when>
      <xsl:when test="$input = 11">Nov</xsl:when>
      <xsl:when test="$input = 12">Dec</xsl:when>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="janes:shipInstance/*[janes:day or janes:month or janes:year]" priority="2">

    <xsl:if test="number(janes:day) &gt; 0 and number(janes:day) &lt; 32">
      <xsl:value-of select="number(janes:day)" />
      <xsl:text>&#160;</xsl:text>
    </xsl:if>

    <xsl:if test="number(janes:month) &gt; 0 and number(janes:month) &lt; 13">
      <xsl:call-template name="monthtext">
        <xsl:with-param name="input">
          <xsl:value-of select="number(janes:month)" />
        </xsl:with-param>
      </xsl:call-template>
      <xsl:text>&#160;</xsl:text>
    </xsl:if>

    <xsl:if test="number(janes:year) &gt; 1000">
      <xsl:value-of select="number(janes:year)" />
    </xsl:if>

    <xsl:apply-templates select="*[not(local-name() = 'day' or local-name() = 'month' or local-name() = 'year')]"/>
  </xsl:template>

  <xsl:template match="janes:mediaBlock[following-sibling::*[1][name() != 'janes:mediaBlock'] or not(following-sibling::*)][preceding-sibling::*[1][name() != 'janes:mediaBlock']  or not(preceding-sibling::*)]">
    <div>
      <xsl:attribute name="class">
        <xsl:text>thumbnail-container u-overflow-hidden</xsl:text>
        <xsl:choose>
          <xsl:when test="janes:mediaObject[@display= 'inline']">
            <xsl:choose>
              <xsl:when test="janes:mediaObject/@thumbnailSize = 'small' and janes:mediaObject/@align = 'center'">
                <xsl:text> width-20</xsl:text>
              </xsl:when>
              <xsl:when test="janes:mediaObject/@thumbnailSize = 'small'">
                <xsl:text> width-20 u-margin-Rl</xsl:text>
              </xsl:when>
              <xsl:when test="janes:mediaObject/@thumbnailSize = 'medium' and janes:mediaObject/@align = 'center'">
                <xsl:text> width-30</xsl:text>
              </xsl:when>
              <xsl:when test="janes:mediaObject/@thumbnailSize = 'medium'">
                <xsl:text> width-30 u-margin-Rl</xsl:text>
              </xsl:when>
              <xsl:when test="janes:mediaObject/@thumbnailSize = 'large'">
                <xsl:text> width-60</xsl:text>
              </xsl:when>
              <xsl:otherwise>
                <xsl:text> width-20</xsl:text>
              </xsl:otherwise>
            </xsl:choose>
            <xsl:if test="janes:mediaObject/@align = 'left' or janes:mediaObject/@align = 'right' or janes:mediaObject/@align = 'center'">
              <xsl:text> pull-</xsl:text>
              <xsl:value-of select="janes:mediaObject[1]/@align"/>
              <xsl:choose>
                <xsl:when test="janes:mediaObject[1]/@align = 'left'">
                </xsl:when>
                <xsl:when test="janes:mediaObject[1]/@align = 'right'">
                  <xsl:text> text-flow-left </xsl:text>
                </xsl:when>
                <xsl:when test="janes:mediaObject[1]/@align = 'center'">
                </xsl:when>
                <xsl:otherwise>
                </xsl:otherwise>
              </xsl:choose>
            </xsl:if>
          </xsl:when>
          <xsl:otherwise>
            <xsl:text> width-20 u-margin-Rl</xsl:text>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:attribute>
      <xsl:apply-templates select="janes:mediaObject">
        <xsl:with-param name="addWidth" select="1" />
      </xsl:apply-templates>
    </div>
  </xsl:template>

  <xsl:template match="janes:mediaBlock[following-sibling::*[1][name() = 'janes:mediaBlock']][preceding-sibling::*[1][name() != 'janes:mediaBlock']  or not(preceding-sibling::*)]">
    <div class="thumbnail-container u-overflow-hidden">
      <xsl:apply-templates select="janes:mediaObject" />
      <xsl:call-template name="doNextImage">
        <xsl:with-param name="interval" select="1" />
      </xsl:call-template>
    </div>
  </xsl:template>

  <xsl:template match="janes:mediaBlock[preceding-sibling::*[1][name() = 'janes:mediaBlock']]" />

  <xsl:template name="doNextImage">
    <xsl:param name="interval" select="1" />
    <xsl:if test="following-sibling::*[position() = $interval][name() = 'janes:mediaBlock']">
      <xsl:apply-templates select="following-sibling::*[position() = $interval]/janes:mediaObject" />

      <xsl:call-template name="doNextImage">
        <xsl:with-param name="interval" select="$interval + 1" />
      </xsl:call-template>
    </xsl:if>
  </xsl:template>

  <xsl:template name="image">
    <xsl:param name="inline">no</xsl:param>
    <xsl:param name="size">thumbnail</xsl:param>

    <xsl:variable name="type">
      <xsl:choose>
        <xsl:when test="$typeflag = 'Images'">
          <xsl:text>p</xsl:text>
        </xsl:when>
        <xsl:when test="not($typeflag = 'News' or $typeflag = 'JAHA')" />
        <xsl:when test="@imageType='picture'">
          <xsl:text>p</xsl:text>
        </xsl:when>
        <xsl:when test="@imageType='graphic'">
          <xsl:text>g</xsl:text>
        </xsl:when>
        <xsl:when test="@imageType='lineDrawing'">
          <xsl:text>l</xsl:text>
        </xsl:when>
        <xsl:when test="@imageType='map'">
          <xsl:text>m</xsl:text>
        </xsl:when>
        <xsl:when test="@imageType='satellite'">
          <xsl:text>x</xsl:text>
        </xsl:when>
      </xsl:choose>
    </xsl:variable>

    <xsl:variable name="ext">
      <xsl:choose>
        <xsl:when test="@type='graphic'">
          <xsl:text>.jpg</xsl:text>
        </xsl:when>
        <xsl:otherwise>
          <xsl:text>.mpg</xsl:text>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:attribute name="href">
      <xsl:value-of select="concat($imagebs, $type, @vurl, $ext)" />
    </xsl:attribute>

    <img alt="{../janes:caption}">
      <xsl:attribute name="src">
        <xsl:choose>
          <xsl:when test="$size='full'">
            <xsl:value-of select="concat($imagebs, $type, @vurl, $ext)" />
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="concat($imagebs, 's', @vurl, $ext)" />
          </xsl:otherwise>
        </xsl:choose>
      </xsl:attribute>
    </img>
  </xsl:template>

  <xsl:template match="janes:mediaObject">
    <xsl:param name="addWidth" />
    <div>

      <xsl:attribute name="class">
        <xsl:text>thumbnail</xsl:text>
        <xsl:choose>
          <xsl:when test="@display='inline'">
            <xsl:if test="@thumbnailSize = 'small' or @thumbnailSize = 'medium' or @thumbnailSize = 'large'">
              <xsl:text> thumbnail</xsl:text>
              <xsl:value-of select="concat('-', @thumbnailSize)"/>
            </xsl:if>
          </xsl:when>
        </xsl:choose>
      </xsl:attribute>

      <xsl:if test="$addWidth = 1">
        <xsl:attribute name="style">width:100%</xsl:attribute>
      </xsl:if>
      <a>
        <xsl:attribute name="name">
          <xsl:value-of select="@vurl" />
        </xsl:attribute>

        <xsl:call-template name="image">
          <xsl:with-param name="inline">yes</xsl:with-param>
          <xsl:with-param name="size">
            <xsl:if test="@thumbnailSize = 'small' or @thumbnailSize = 'medium' or @thumbnailSize = 'large'">
              <xsl:value-of select="'full'" />
            </xsl:if>
          </xsl:with-param>
        </xsl:call-template>
      </a>
      <div class="caption">
        <p class="text-muted text-left">
          <xsl:value-of select="@vurl" />
        </p>
        <p>
          <xsl:apply-templates select="../janes:caption" />
          <xsl:if test='string(./@credit)'>
            (<xsl:value-of select="./@credit" />)
          </xsl:if>

          <xsl:apply-templates select="../janes:doubleList">
            <xsl:with-param name="horizontal" select="false" />
          </xsl:apply-templates>
        </p>
      </div>
    </div>
  </xsl:template>

  <xsl:template match="janes:mediaObject" mode="topPage">
    <xsl:call-template name="image">
      <xsl:with-param name="size">full</xsl:with-param>
    </xsl:call-template>
  </xsl:template>

  <xsl:template match="janes:title" mode="toc">
    <xsl:choose>
      <xsl:when test="parent::*[local-name()='sect1']">
        <li class="list-group-item">
          <xsl:call-template name="sideNavLevel">
            <xsl:with-param name="level">1</xsl:with-param>
          </xsl:call-template>
        </li>
      </xsl:when>
      <xsl:when test="parent::*[local-name()='sect2']">
        <li class="list-group-item sub">
          <i class="icon-angle-right"></i>
          <xsl:call-template name="sideNavLevel">
            <xsl:with-param name="level">2</xsl:with-param>
          </xsl:call-template>
        </li>
      </xsl:when>
      <xsl:when test="parent::*[local-name()='sect3'] and not(ancestor::*/@qualifier='summary')">
        <li class="list-group-item sub">
          <i class="icon-angle-right"></i>
          <xsl:call-template name="sideNavLevel">
            <xsl:with-param name="level">3</xsl:with-param>
          </xsl:call-template>
        </li>
      </xsl:when>
      <xsl:otherwise />
    </xsl:choose>
  </xsl:template>

  <xsl:template name="sideNavLevel">
    <xsl:param name="level">1</xsl:param>
    <a>
      <xsl:attribute name="href">
        <xsl:value-of select="concat('#', normalize-space() )" />
      </xsl:attribute>
      <xsl:apply-templates />
    </a>
  </xsl:template>

  <xsl:template match="janes:title" mode="contents">
    <xsl:choose>
      <xsl:when test="parent::*[local-name()='sect1']">
        <xsl:element name="a">
          <xsl:attribute name="href">
            <xsl:value-of select="concat('#', normalize-space() )" />
          </xsl:attribute>
          <xsl:apply-templates />
        </xsl:element>
      </xsl:when>
      <xsl:when test="parent::*[local-name()='sect2']">
        <xsl:element name="a">
          <xsl:attribute name="href">
            <xsl:value-of select="concat('#', normalize-space() )" />
          </xsl:attribute>
          <xsl:apply-templates />
        </xsl:element>
      </xsl:when>
      <xsl:when test="parent::*[local-name()='sect3'] and not(ancestor::*/@qualifier='summary')">
        <xsl:element name="a">
          <xsl:attribute name="href">
            <xsl:value-of select="concat('#', normalize-space() )" />
          </xsl:attribute>
          <xsl:apply-templates />
        </xsl:element>
      </xsl:when>
      <xsl:otherwise />
    </xsl:choose>
  </xsl:template>

  <xsl:template match="janes:title" mode="plain">
    <xsl:if test="preceding-sibling::janes:title">
      <br/>
    </xsl:if>
    <a>
      <xsl:attribute name="name">
        <xsl:value-of select="normalize-space()" />
      </xsl:attribute>
    </a>
    <xsl:apply-templates />
  </xsl:template>

  <xsl:template match="janes:title" mode="very_plain">
    <xsl:apply-templates>
      <xsl:with-param name="plain">true</xsl:with-param>
    </xsl:apply-templates>
  </xsl:template>

  <xsl:template match="janes:title">
    <a>
      <xsl:attribute name="name">
        <xsl:value-of select="normalize-space()" />
      </xsl:attribute>
    </a>
    <xsl:choose>
      <xsl:when test="@qualifier='rating'">
        <div>
          <xsl:apply-templates />
        </div>
      </xsl:when>
      <xsl:when test="ancestor::*[@qualifier='box' or @qualifier='event' or @qualifier='summary'] or (.='Summary' and following-sibling::janes:sect2/@qualifier='box')">
        <span>
          <xsl:attribute name="id">
            <xsl:value-of select="concat (local-name(..), 'Title')" />
          </xsl:attribute>

          <xsl:if test="@updated='y' or ancestor::*[@updated='y']">
            <xsl:attribute name="class">green1</xsl:attribute>
          </xsl:if>
          <xsl:apply-templates />
        </span>
      </xsl:when>

      <xsl:when test="local-name(..) = 'sect1'">
        <h2>
          <xsl:if test="@updated='y' or ancestor::*[@updated='y']">
            <xsl:attribute name="class">green1</xsl:attribute>
          </xsl:if>
          <xsl:apply-templates />
          <xsl:if test="count(preceding::janes:title[local-name(..) = 'sect1']) &gt; 1 and count(preceding::janes:title[local-name(..) = 'sect1']) mod 2 = 1">
            <a href='#' class='pull-right u-font-65 hidden-print'>Back to top</a>
          </xsl:if>
        </h2>
      </xsl:when>
      <xsl:when test="local-name(..) = 'sect2'">
        <h3>
          <xsl:if test="@updated='y' or ancestor::*[@updated='y']">
            <xsl:attribute name="class">green1</xsl:attribute>
          </xsl:if>
          <xsl:apply-templates />
        </h3>
      </xsl:when>
      <xsl:when test="local-name(..) = 'sect3'">
        <h4>
          <xsl:if test="@updated='y' or ancestor::*[@updated='y']">
            <xsl:attribute name="class">green1</xsl:attribute>
          </xsl:if>
          <xsl:apply-templates />
        </h4>
      </xsl:when>
      <xsl:otherwise>
        <h5>
          <xsl:if test="@updated='y' or ancestor::*[@updated='y']">
            <xsl:attribute name="class">green1</xsl:attribute>
          </xsl:if>
          <xsl:apply-templates />
        </h5>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="janes:para">
    <p>
      <xsl:variable name="extraclass">
        <xsl:if test="@updated='y' or ancestor::*[@updated='y']">
          <xsl:text> green1</xsl:text>
        </xsl:if>
      </xsl:variable>
      <xsl:choose>
        <xsl:when test="local-name(..)='entry'">
          <xsl:attribute name="class">
            <xsl:value-of select="$extraclass" />
          </xsl:attribute>
        </xsl:when>
        <xsl:when test="../@qualifier='summary'">
          <xsl:attribute name="class">
            <xsl:value-of select="$extraclass" />
          </xsl:attribute>
        </xsl:when>
        <xsl:when test="parent::janes:address[not(@qualifier) or @qualifier = '']">
          <xsl:attribute name="class">
            <xsl:text>address</xsl:text>
            <xsl:value-of select="$extraclass" />
          </xsl:attribute>
        </xsl:when>
        <xsl:otherwise>
          <xsl:attribute name="class">
            <xsl:value-of select="$extraclass" />
          </xsl:attribute>
        </xsl:otherwise>
      </xsl:choose>

      <xsl:if test="@indentLevel and @indentLevel &gt; 0">
        <xsl:call-template name="indent">
          <xsl:with-param name="level" select="@indentLevel" />
        </xsl:call-template>
      </xsl:if>
      <xsl:apply-templates />
    </p>
  </xsl:template>

  <xsl:template match="janes:listItem//janes:para">

    <xsl:if test="preceding-sibling::janes:para">
      <br />
    </xsl:if>

    <xsl:choose>
      <xsl:when test="normalize-space(text()) = '' and not(janes:render) and not(janes:label)">
        <xsl:apply-templates select="*" />
      </xsl:when>
      <xsl:otherwise>
        <span>
          <xsl:if test="@updated='y' or ancestor::*[@updated='y']">
            <xsl:attribute name="class">green1</xsl:attribute>
          </xsl:if>
          <xsl:if test="@indentLevel and @indentLevel &gt; 0">
            <xsl:call-template name="indent">
              <xsl:with-param name="level" select="@indentLevel" />
            </xsl:call-template>
          </xsl:if>
          <xsl:apply-templates />
        </span>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  <xsl:template match="janes:sup">
    <sup>
      <xsl:apply-templates />
    </sup>
  </xsl:template>

  <xsl:template match="janes:sub">
    <sub>
      <xsl:apply-templates />
    </sub>
  </xsl:template>

  <xsl:template match="janes:list">
    <xsl:apply-templates select="janes:title|janes:shortTitle" />
    <xsl:choose>
      <xsl:when test="@type = 'alpha'">
        <ol class="u-overflow-hidden">
          <xsl:apply-templates select="janes:listItem" />
        </ol>
      </xsl:when>
      <xsl:when test="@type = 'number'">
        <ol class="u-overflow-hidden">
          <xsl:apply-templates select="janes:listItem" />
        </ol>
      </xsl:when>
      <xsl:when test="@type = 'simple'">
        <ul class="u-overflow-hidden">
          <xsl:apply-templates select="janes:listItem" />
        </ul>
      </xsl:when>
      <xsl:otherwise>
        <ul class="u-overflow-hidden">
          <xsl:apply-templates select="janes:listItem" />
        </ul>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="janes:listItem">
    <li>
      <xsl:apply-templates />
    </li>
  </xsl:template>

  <xsl:template match="janes:render">
    <xsl:param name="plain">false</xsl:param>
    <xsl:choose>
      <xsl:when test="$plain = 'true'">
        <xsl:apply-templates />
      </xsl:when>
      <xsl:when test="@appearance = 'bold'">
        <xsl:element name="strong">
          <xsl:apply-templates />
        </xsl:element>
      </xsl:when>
      <xsl:when test="@appearance = 'italic'">
        <xsl:element name="em">
          <xsl:apply-templates />
        </xsl:element>
      </xsl:when>
      <xsl:when test="@appearance = 'boldItalic'">
        <xsl:element name="strong">
          <xsl:element name="em">
            <xsl:apply-templates />
          </xsl:element>
        </xsl:element>
      </xsl:when>
      <xsl:otherwise>
        <span class="{@appearance}">
          <xsl:apply-templates />
        </span>
      </xsl:otherwise>
    </xsl:choose>
    <!--<xsl:text>&#160;</xsl:text> -->
    <!-- Hack for IE problem of stripping whitespace-only text nodes -->
  </xsl:template>

  <xsl:template match="janes:table">
    <xsl:param name="caption"></xsl:param>
    <div class="panel panel-default u-overflow-hidden">
      <xsl:if test="not(normalize-space(janes:title)='')">
        <xsl:element name="div">
          <xsl:attribute name="class">
            <xsl:choose>
              <xsl:when test="@updated='y' or ancestor::*[@updated='y'] or janes:shortTitle[@updated='y'] or janes:title[@updated='y']">
                <xsl:text>panel-heading green1</xsl:text>
              </xsl:when>
              <xsl:otherwise>
                <xsl:text>panel-heading</xsl:text>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:attribute>
          <xsl:apply-templates select="janes:title" mode="plain" />
          <xsl:if test="not(normalize-space(janes:shortTitle)='')">
            <xsl:for-each select="janes:shortTitle">
              <br/>
              <xsl:value-of select="." />
            </xsl:for-each>
          </xsl:if>
        </xsl:element>
      </xsl:if>
      <table class="table table-bordered">
        <xsl:choose>
          <xsl:when test="not($caption='')">
            <caption class="sr-only">$caption</caption>
          </xsl:when>
          <xsl:when test="not(normalize-space(janes:title)='')">
            <caption class="sr-only">
              <xsl:if test="not(normalize-space(janes:shortTitle)='')">
                <xsl:for-each select="janes:shortTitle">
                  <xsl:value-of select="." />
                </xsl:for-each>
              </xsl:if>
              <xsl:apply-templates select="janes:title" mode="very_plain" />
            </caption>
          </xsl:when>
          <xsl:otherwise>
            <xsl:if test="preceding-sibling::*[1][(local-name() = 'title' or local-name() = 'para') and string-length(.) &lt; 100]">
              <caption class="sr-only">
                <xsl:value-of select="preceding-sibling::*[1][local-name() = 'title' or local-name() = 'para']" />
              </caption>
            </xsl:if>
          </xsl:otherwise>
        </xsl:choose>
        <xsl:apply-templates select="*[not(name() = 'janes:title')]" />
      </table>
    </div>
  </xsl:template>

  <xsl:template match="janes:tgroup">
    <xsl:apply-templates />
  </xsl:template>

  <xsl:template match="janes:tbody">
    <xsl:apply-templates />
  </xsl:template>

  <xsl:template match="janes:row">
    <tr>
      <xsl:apply-templates />
    </tr>
  </xsl:template>

  <xsl:template match="janes:thead">
    <thead>
      <xsl:apply-templates />
    </thead>
  </xsl:template>
  <xsl:template match="janes:entry">
    <xsl:choose>
      <xsl:when test="local-name(../..)='thead'">
        <th valign="top">
          <xsl:if test="janes:noteGroup">
            <xsl:attribute name="colspan">
              <xsl:value-of select="count(../../../janes:colspec)" />
            </xsl:attribute>
          </xsl:if>
          <xsl:if test="string() = ''">
            &#160;
          </xsl:if>
          <xsl:apply-templates />
        </th>
      </xsl:when>
      <xsl:otherwise>
        <td valign="top">
          <xsl:if test="janes:noteGroup">
            <xsl:attribute name="colspan">
              <xsl:value-of select="count(../../../janes:colspec)" />
            </xsl:attribute>
          </xsl:if>
          <xsl:if test="string() = ''">
            &#160;
          </xsl:if>
          <xsl:apply-templates />
        </td>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- Notegroups -->
  <xsl:template match="janes:note">
    <xsl:choose>
      <xsl:when test="@qualifier = 'general'">
        <!--<xsl:value-of select="$n" />
				<xsl:value-of select="$n" />-->
        <xsl:apply-templates />
        <!--<xsl:value-of select="$n" />-->
      </xsl:when>
      <xsl:otherwise>
        <li>
          <xsl:apply-templates />
        </li>
        <!--<xsl:value-of select="$n" />-->
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match='janes:note' mode='para'>
    <xsl:apply-templates />
  </xsl:template>

  <xsl:template match='janes:noteGroup/janes:title' mode='para'>
    <xsl:apply-templates />
    <br />
    <xsl:value-of select="$n" />
  </xsl:template>

  <xsl:template match="janes:noteGroup">
    <xsl:choose>
      <xsl:when test='@qualifier="general" and parent::janes:entry'>
        <xsl:apply-templates />
      </xsl:when>
      <xsl:when test='@qualifier="number"'>
        <xsl:apply-templates select="*[not(local-name() = 'note')]"/>
        <xsl:value-of select="$n" />
        <ol type="1">
          <xsl:value-of select="$n" />
          <xsl:apply-templates select="janes:note"/>
        </ol>
        <xsl:value-of select="$n" />
      </xsl:when>
      <xsl:when test='parent::janes:sect1 or parent::janes:sect2 or parent::janes:sect3 or parent::janes:sect4 or parent::janes:sect5 or parent::janes:sectN'>
        <xsl:apply-templates mode="para" />
      </xsl:when>
      <xsl:otherwise>
        <xsl:apply-templates select="*[not(local-name() = 'note')]"/>
        <xsl:value-of select="$n" />
        <ol type="1" style="score-spaces: false; font-style: italic">
          <xsl:value-of select="$n" />
          <xsl:apply-templates select="janes:note"/>
        </ol>
        <xsl:value-of select="$n" />
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- Double Lists -->
  <!-- Standard Double List -->
  <xsl:template match="janes:doubleList">
    <xsl:param name="horizontal">true</xsl:param>

    <xsl:if test="janes:title/text()!=''">
      <xsl:apply-templates select="janes:title"/>
    </xsl:if>

    <dl>
      <xsl:choose>
        <xsl:when test="$horizontal='true'">
          <xsl:attribute name="class">dl-horizontal u-overflow-hidden</xsl:attribute>
        </xsl:when>
        <xsl:otherwise>
          <xsl:attribute name="class">u-overflow-hidden</xsl:attribute>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:apply-templates select="*[ not(name() = 'janes:title') ]" />
    </dl>
  </xsl:template>
  <xsl:template match="janes:first[parent::janes:doubleList]">
    <dt>
      <xsl:if test="@updated='y' or ancestor::*[@updated='y']">
        <xsl:attribute name="class">green1</xsl:attribute>
      </xsl:if>
      <xsl:apply-templates />
    </dt>
  </xsl:template>
  <xsl:template match="janes:second[parent::janes:doubleList]">
    <dd>
      <xsl:if test="@updated='y' or ancestor::*[@updated='y']">
        <xsl:attribute name="class">green1</xsl:attribute>
      </xsl:if>
      <xsl:apply-templates />
    </dd>
  </xsl:template>

  <!-- Key Personnel double list -->
  <!--<xsl:template match='janes:doubleList[@qualifier="keyPersonnel"]'>
			<dl class="dl-horizontal">
						<xsl:for-each select='janes:first'>
								<xsl:apply-templates />
								<xsl:apply-templates select='following-sibling::janes:second[1]' />
						</xsl:for-each>
				</dl>
		</xsl:template>

		<xsl:template match="janes:para[parent::*[local-name()='first']]">
				<dt>
						<xsl:if test="@updated='y' or ancestor::*[@updated='y']">
								<xsl:attribute name="class">green1</xsl:attribute>
						</xsl:if>
						<xsl:apply-templates />
				</dt>
		</xsl:template>
		<xsl:template match="janes:para[parent::*[local-name()='second']]">
				<dd>
						<xsl:if test="@updated='y' or ancestor::*[@updated='y']">
								<xsl:attribute name="class">green1</xsl:attribute>
						</xsl:if>
						<xsl:apply-templates />
				</dd>
		</xsl:template>-->

  <!-- Short title previously handled with title -->
  <xsl:template match="janes:shortTitle">
  </xsl:template>

  <!-- Remove repeated text "Specifications" -->
  <xsl:template match="janes:table/janes:title[. = 'Specifications' and ancestor::*/janes:title='Specifications']">
  </xsl:template>

  <xsl:template match="janes:authoredBy">
    <xsl:apply-templates />
  </xsl:template>

  <xsl:template match="janes:authorName">
    <xsl:if test="not(. = '')">
      <b>
        <xsl:apply-templates />
      </b>
    </xsl:if>
  </xsl:template>

  <xsl:template match="janes:position">
    <xsl:if test="not(. = '')">
      <xsl:text>&#160;</xsl:text>
      <xsl:apply-templates />
    </xsl:if>
  </xsl:template>

  <xsl:template match="janes:groupName">
    <xsl:if test="not(. = '')">
      <xsl:text>&#160;</xsl:text>
      <xsl:apply-templates />
    </xsl:if>
  </xsl:template>

  <xsl:template match="janes:contact">
    <xsl:if test="not(. = '')">
      <br>
        <xsl:text>&#160;&#160;&#160;</xsl:text>
        <xsl:apply-templates />
      </br>
    </xsl:if>
  </xsl:template>

  <xsl:template match="janes:site">
    <xsl:if test="not(. = '')">
      <xsl:text>,&#160;</xsl:text>
      <xsl:apply-templates />
    </xsl:if>
  </xsl:template>

  <xsl:template match="janes:publication">
    <xsl:if test="not(. = '')">
      <i>
        <xsl:text>&#160;</xsl:text>
        <xsl:apply-templates />
      </i>
    </xsl:if>
  </xsl:template>

  <xsl:template match="janes:relatedInfo">

    <div class="panel panel-default u-overflow-hidden">
      <div class="panel-heading">
        <xsl:choose>
          <xsl:when test="janes:title and not(janes:title = '')">
            <xsl:apply-templates select="janes:title" mode="plain" />
          </xsl:when>
          <xsl:otherwise>
            <xsl:text>Related Articles</xsl:text>
          </xsl:otherwise>
        </xsl:choose>
      </div>
      <div class="panel-body">
        <xsl:apply-templates select="*[ not(name() = 'janes:title') ]" />
      </div>
    </div>

  </xsl:template>

  <xsl:template match="janes:listItem/janes:relatedArticle">
    <xsl:apply-templates />
  </xsl:template>

  <xsl:template match="janes:url">
    <!--
			<xsl:element name="a">
			<xsl:attribute name="href"><xsl:value-of select="@xlink:href" /></xsl:attribute>
				<xsl:apply-templates />
				</xsl:element>
			-->
    <xsl:choose>
      <xsl:when test="not(contains(@xlink:href, '/'))">
        <xsl:element name="a">
          <xsl:attribute name="target">_blank</xsl:attribute>
          <xsl:attribute name="href">
            <xsl:value-of select="concat(substring-before(concat('/Janes/DisplayFile/', @xlink:href), '.xml'), '?pubabbrev=', $pubabbrev)" />
          </xsl:attribute>
          <xsl:apply-templates />
        </xsl:element>
      </xsl:when>
      <xsl:otherwise>
        <xsl:element name="a">
          <xsl:attribute name="target">_blank</xsl:attribute>
          <xsl:attribute name="href">
            <xsl:value-of select="@xlink:href" />
          </xsl:attribute>
          <xsl:apply-templates />
        </xsl:element>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="janes:link">
    <xsl:choose>
      <xsl:when test="@qualifier='noteRef' or @qualifier='noteref'">
        <xsl:call-template name="tableNoteRef">
          <xsl:with-param name="hrefid" select="@xlink:href" />
        </xsl:call-template>
      </xsl:when>
      <xsl:when test="@qualifier='spreadsheet' or @qualifier='pdf' or @qualifier='presentation' or @qualifier='video' or @qualifier='audio' or @qualifier='kml' or @qualifier='kmz'">
        <xsl:element name="a">
          <xsl:attribute name="href">
            <xsl:value-of select="concat('file.axd?f=', $nimagebs, @xlink:href)" />
          </xsl:attribute>
          <xsl:attribute name="target">
            <xsl:value-of select="'download'" />
          </xsl:attribute>
          <xsl:apply-templates />
        </xsl:element>
      </xsl:when>
      <xsl:when test="@qualifier='tableau'">
      </xsl:when>
      <xsl:when test="not(contains(@xlink:href, '/'))">
        <xsl:element name="a">
          <xsl:attribute name="target">_blank</xsl:attribute>
          <xsl:attribute name="href">
            <xsl:value-of select="concat(substring-before(concat('/Janes/DisplayFile/', @xlink:href), '.xml'), '?pubabbrev=', $pubabbrev)" />
          </xsl:attribute>
          <xsl:apply-templates />
        </xsl:element>
      </xsl:when>
      <xsl:otherwise>
        <xsl:apply-templates />
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="tableNoteRef">
    <xsl:param name="hrefid" select="@xlink:href" />

    <xsl:choose>
      <!-- If linktext doesn't exist already -->
      <xsl:when test="not(janes:linkText) or janes:linkText = ''">
        <!-- Find all notes with a matching ID (wherever they appear) -->
        <xsl:for-each select="ancestor::janes:record/descendant::janes:noteGroup[@qualifier='number']/janes:note[@id = $hrefid ]">
          <!-- This bit finds the number of the note in relation to the notes on the same level, ie the number to add in as a reference -->
          <xsl:variable name="nr">
            <xsl:number count="janes:note" level="single" />
          </xsl:variable>
          <!-- Create the link -->
          <xsl:element name="a">
            <xsl:attribute name="href">
              <xsl:value-of select="concat('#', $hrefid)" />
            </xsl:attribute>
            <!-- If there are multiple notes with the same ID, add in comma -->
            <sup>
              <xsl:value-of select="$nr" />
              <xsl:if test="not(position() = last())">
                <xsl:text>,</xsl:text>
              </xsl:if>
            </sup>
          </xsl:element>
          <!-- If there are multiple notes with the same ID, add in space (not in link to avoid unsightly underline) -->
          <xsl:if test="not(position() = last())">
            <xsl:text>&#160;</xsl:text>
          </xsl:if>
        </xsl:for-each>
      </xsl:when>
      <!-- Otherwise (if linktext exists), use that and do not renumber -->
      <xsl:otherwise>
        <xsl:element name="a">
          <xsl:attribute name="href">
            <xsl:value-of select="concat('#', $hrefid)" />
          </xsl:attribute>
          <xsl:apply-templates />
        </xsl:element>
      </xsl:otherwise>
    </xsl:choose>

    <!-- For multiple reference links to different notes, add in punctuation ONLY if nothing already between the links-->
    <xsl:if test="following-sibling::node()[1][local-name() = 'link'][@qualifier='noteRef' or @qualifier='noteref']">
      <sup>
        <xsl:text>, </xsl:text>
      </sup>
    </xsl:if>
  </xsl:template>

  <xsl:template match="janes:linkText">
    <xsl:apply-templates />
  </xsl:template>

  <xsl:template match="janes:relatedArticle">
    <p>
      <xsl:apply-templates />
    </p>
  </xsl:template>

  <xsl:template name="indent">
    <xsl:param name="level" />

    <xsl:text>&#160;&#160;&#160;&#160;</xsl:text>
    <xsl:if test="$level > 1">
      <xsl:call-template name="indent">
        <xsl:with-param name="level" select="$level - 1" />
      </xsl:call-template>
    </xsl:if>
  </xsl:template>

  <xsl:template match="janes:para[@qualifier='division']" />

  <xsl:template name="subsOf">
    <xsl:if test=".//janes:para[@qualifier='subs of']">
      <h3>
        <xsl:for-each select=".//janes:para[@qualifier='subs of']">
          <xsl:value-of select="." />
          <br />
        </xsl:for-each>
      </h3>
    </xsl:if>
  </xsl:template>

  <xsl:template match="janes:para[@qualifier='subs of']"></xsl:template>

  <xsl:template match="janes:para[@qualifier='airport identifier']">

    <b>
      <xsl:text>Airport Identifier: </xsl:text>
    </b>

    <xsl:value-of select="janes:label[@qualifier='Name']" />
    <xsl:if test="janes:label[@qualifier='Abbr'] !=''">
      <xsl:text> (</xsl:text>
      <xsl:value-of select="janes:label[@qualifier='Abbr']" />
      <xsl:text>)</xsl:text>
    </xsl:if>

    <br />
    <xsl:value-of select="$n" />
  </xsl:template>

  <xsl:template match="janes:para[@qualifier='airline identifier']">

    <b>
      <xsl:text>Airline Identifier: </xsl:text>
    </b>

    <xsl:value-of select="janes:label[@qualifier='Name']" />
    <xsl:if test="janes:label[@qualifier='Abbr'] !=''">
      <xsl:text> (</xsl:text>
      <xsl:value-of select="janes:label[@qualifier='Abbr']" />
      <xsl:text>)</xsl:text>
    </xsl:if>
    <br />
    <xsl:value-of select="$n" />
  </xsl:template>

  <!-- IGRU -->
  <!-- ******************************************************************************************* -->
  <xsl:template match="janes:address[@qualifier='mail']">
    <xsl:choose>
      <xsl:when test="ancestor::janes:sect1/janes:address[@qualifier='location']">
        <h2>Mailing Address</h2>
      </xsl:when>
      <xsl:otherwise>
        <h2>Address</h2>
      </xsl:otherwise>
    </xsl:choose>
    <xsl:if test="./janes:para[1][not(boolean(@qualifier))]">
      <xsl:value-of select="./janes:para[1]" />
      <br />
    </xsl:if>
    <xsl:if test="./janes:para[2][not(boolean(@qualifier))]">
      <xsl:value-of select="./janes:para[2]" />
      <br />
    </xsl:if>
    <xsl:if test="./janes:para[3][not(boolean(@qualifier))]">
      <xsl:value-of select="./janes:para[3]" />
      <br />
    </xsl:if>
    <xsl:variable name="pobox" select="./janes:para[@qualifier='POBox']" />
    <xsl:variable name="postocde" select="./janes:para[@qualifier='postcode']" />
    <xsl:variable name="city" select="./janes:para[@qualifier='city']" />
    <xsl:variable name="district" select="./janes:para[@qualifier='district']" />
    <xsl:variable name="county" select="./janes:para[@qualifier='county']" />
    <xsl:variable name="country"  select="./janes:para[@qualifier='country']" />
    <xsl:choose>
      <xsl:when test="janes:para[@qualifier='postcode']/following-sibling::janes:para[@qualifier='city']">
        <xsl:if test="string($pobox)">
          <xsl:value-of select="$pobox" />
          <br />
          <xsl:value-of select="$n" />
        </xsl:if>
        <xsl:if test="string($postocde)">
          <xsl:value-of select="$postocde" />
          <xsl:text>&#160;</xsl:text>
          <xsl:value-of select="$n" />
        </xsl:if>
        <xsl:if test="string($city)">
          <xsl:value-of select="$city" />
          <xsl:text>&#160;</xsl:text>
          <xsl:value-of select="$n" />
        </xsl:if>
        <xsl:choose>
          <xsl:when test="not(string($district))">
            <br />
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="$district" />
            <br />
          </xsl:otherwise>
        </xsl:choose>
        <xsl:if test="string($county)">
          <xsl:value-of select="$county" />
          <br />
          <xsl:value-of select="$n" />
        </xsl:if>
        <xsl:if test="string($country)">
          <xsl:value-of select="$country" />
          <xsl:value-of select="$n" />
        </xsl:if>
      </xsl:when>
      <xsl:when test="janes:para[@qualifier='postcode']/following-sibling::janes:para[@qualifier='district']">
        <xsl:if test="string($pobox)">
          <xsl:value-of select="$pobox" />
          <br />
          <xsl:value-of select="$n" />
        </xsl:if>
        <xsl:if test="string($postocde)">
          <xsl:value-of select="$postocde" />
          <xsl:text>&#160;</xsl:text>
          <xsl:value-of select="$n" />
        </xsl:if>
        <xsl:if test="string($city)">
          <xsl:value-of select="$city" />
          <xsl:text>&#160;</xsl:text>
          <xsl:value-of select="$n" />
        </xsl:if>
        <xsl:choose>
          <xsl:when test="not(string($district))">
            <br />
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="$district" />
            <br />
          </xsl:otherwise>
        </xsl:choose>
        <xsl:if test="string($county)">
          <xsl:value-of select="$county" />
          <br />
          <xsl:value-of select="$n" />
        </xsl:if>
        <xsl:if test="string($country)">
          <xsl:value-of select="$country" />
          <xsl:value-of select="$n" />
        </xsl:if>
      </xsl:when>
      <xsl:when test="janes:para[@qualifier='postcode']/preceding-sibling::janes:para[1][@qualifier='county']">
        <xsl:if test="string($pobox)">
          <xsl:value-of select="$pobox" />
          <br />
          <xsl:value-of select="$n" />
        </xsl:if>
        <xsl:if test="string($city)">
          <xsl:value-of select="$city" />
          <xsl:text>&#160;</xsl:text>
          <xsl:value-of select="$n" />
        </xsl:if>
        <xsl:choose>
          <xsl:when test="not(string($city))">
            <xsl:if test="not(string($district))">
            </xsl:if>
          </xsl:when>
          <xsl:when test="string($city)">
            <xsl:if test="not(string($district))">
              <br />
            </xsl:if>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="$district" />
            <br />
          </xsl:otherwise>
        </xsl:choose>
        <xsl:if test="string($county)">
          <xsl:value-of select="$county" />
          <xsl:text>&#160;</xsl:text>
          <xsl:value-of select="$n" />
        </xsl:if>
        <xsl:choose>
          <xsl:when test="not(string($postocde))">
            <br />
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="$postocde" />
            <br />
          </xsl:otherwise>
        </xsl:choose>

        <xsl:if test="string($country)">
          <xsl:value-of select="$country" />
          <xsl:value-of select="$n" />
        </xsl:if>
      </xsl:when>
      <xsl:when test="janes:para[@qualifier='country']/preceding-sibling::janes:para[not(@qualifier)]">
        <xsl:if test="string($pobox)">
          <xsl:value-of select="$pobox" />
          <br />
          <xsl:value-of select="$n" />
        </xsl:if>
        <xsl:if test="string($postocde)">
          <xsl:value-of select="$postocde" />
          <xsl:text>&#160;</xsl:text>
          <xsl:value-of select="$n" />
        </xsl:if>
        <xsl:if test="string($city)">
          <xsl:value-of select="$city" />
          <xsl:text>&#160;</xsl:text>
          <xsl:value-of select="$n" />
        </xsl:if>
        <xsl:choose>
          <xsl:when test="not(string($district))"></xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="$district" />
            <br />
          </xsl:otherwise>
        </xsl:choose>
        <xsl:if test="string($county)">
          <xsl:value-of select="$county" />
          <xsl:text>&#160;</xsl:text>
          <xsl:value-of select="$n" />
        </xsl:if>
        <xsl:if test="string($country)">
          <xsl:value-of select="$country" />
          <br />
          <xsl:value-of select="$n" />
        </xsl:if>
      </xsl:when>
      <xsl:otherwise>
        <xsl:if test="string($pobox)">
          <xsl:value-of select="$pobox" />
          <br />
          <xsl:value-of select="$n" />
        </xsl:if>
        <xsl:if test="string($postocde)">
          <xsl:value-of select="$postocde" />
          <xsl:text>&#160;</xsl:text>
          <xsl:value-of select="$n" />
        </xsl:if>
        <xsl:if test="string($city)">
          <xsl:value-of select="$city" />
          <xsl:text>&#160;</xsl:text>
          <xsl:value-of select="$n" />
        </xsl:if>
        <xsl:choose>
          <xsl:when test="not(string($district))">
            <br />
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="$district" />
            <br />
          </xsl:otherwise>
        </xsl:choose>
        <xsl:if test="string($county)">
          <xsl:value-of select="$county" />
          <br />
          <xsl:value-of select="$n" />
        </xsl:if>

        <xsl:if test="string($country)">
          <xsl:value-of select="$country" />
          <xsl:value-of select="$n" />
        </xsl:if>
      </xsl:otherwise>
    </xsl:choose>
    <p>
      <xsl:value-of select="$n" />
    </p>
    <xsl:apply-templates select="janes:dataGroup" />
  </xsl:template>
  <!-- ********************************************* -->

  <xsl:template match="janes:address[@qualifier='location']">
    <h2>Location Address</h2>
    <xsl:value-of select="$n" />
    <xsl:if test="./janes:para[1][not(boolean(@qualifier))]">
      <xsl:value-of select="./janes:para[1]" />
      <br />
    </xsl:if>
    <xsl:if test="./janes:para[2][not(boolean(@qualifier))]">
      <xsl:value-of select="./janes:para[2]" />
      <br />
    </xsl:if>
    <xsl:if test="./janes:para[3][not(boolean(@qualifier))]">
      <xsl:value-of select="./janes:para[3]" />
      <br />
    </xsl:if>
    <!-- !! -->
    <xsl:variable name="pobox" select="./janes:para[@qualifier='POBox']" />
    <!-- !! -->
    <xsl:variable name="postocde"  select="./janes:para[@qualifier='postcode']" />
    <!-- !! -->
    <xsl:variable name="city"  select="./janes:para[@qualifier='city']" />
    <!-- !! -->
    <xsl:variable name="district" select="./janes:para[@qualifier='district']" />
    <!-- !! -->
    <xsl:variable name="county" select="./janes:para[@qualifier='county']" />
    <!-- !! -->
    <xsl:variable name="country" select="./janes:para[@qualifier='country']" />
    <xsl:choose>
      <xsl:when test="janes:para[@qualifier='postcode']/following-sibling::janes:para[@qualifier='city']">
        <xsl:if test="string($pobox)">
          <xsl:value-of select="$pobox" />
          <br />
          <xsl:value-of select="$n" />
        </xsl:if>
        <xsl:if test="string($postocde)">
          <xsl:value-of select="$postocde" />
          <xsl:text>&#160;</xsl:text>
          <xsl:value-of select="$n" />
        </xsl:if>
        <xsl:if test="string($city)">
          <xsl:value-of select="$city" />
          <xsl:text>&#160;</xsl:text>
          <xsl:value-of select="$n" />
        </xsl:if>
        <xsl:choose>
          <xsl:when test="not(string($district))">
            <br />
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="$district" />
            <br />
          </xsl:otherwise>
        </xsl:choose>
        <xsl:if test="string($county)">
          <xsl:value-of select="$county" />
          <br />
          <xsl:value-of select="$n" />
        </xsl:if>
        <xsl:if test="string($country)">
          <xsl:value-of select="$country" />
          <xsl:value-of select="$n" />
        </xsl:if>
      </xsl:when>
      <xsl:when test="janes:para[@qualifier='postcode']/following-sibling::janes:para[@qualifier='district']">
        <xsl:if test="string($pobox)">
          <xsl:value-of select="$pobox" />
          <br />
          <xsl:value-of select="$n" />
        </xsl:if>
        <xsl:if test="string($postocde)">
          <xsl:value-of select="$postocde" />
          <xsl:text>&#160;</xsl:text>
          <xsl:value-of select="$n" />
        </xsl:if>
        <xsl:if test="string($city)">
          <xsl:value-of select="$city" />
          <xsl:text>&#160;</xsl:text>
          <xsl:value-of select="$n" />
        </xsl:if>
        <xsl:choose>
          <xsl:when test="not(string($district))">
            <br />
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="$district" />
            <br />
          </xsl:otherwise>
        </xsl:choose>
        <xsl:if test="string($county)">
          <xsl:value-of select="$county" />
          <br />
          <xsl:value-of select="$n" />
        </xsl:if>
        <xsl:if test="string($country)">
          <xsl:value-of select="$country" />
          <xsl:value-of select="$n" />
        </xsl:if>
      </xsl:when>
      <xsl:when test="janes:para[@qualifier='postcode']/preceding-sibling::janes:para[1][@qualifier='county']">
        <xsl:if test="string($pobox)">
          <xsl:value-of select="$pobox" />
          <br />
          <xsl:value-of select="$n" />
        </xsl:if>
        <xsl:if test="string($city)">
          <xsl:value-of select="$city" />
          <xsl:text>&#160;</xsl:text>
          <xsl:value-of select="$n" />
        </xsl:if>
        <xsl:choose>
          <xsl:when test="not(string($city))">
            <xsl:if test="not(string($district))">
            </xsl:if>
          </xsl:when>
          <xsl:when test="string($city)">
            <xsl:if test="not(string($district))">
              <br />
            </xsl:if>
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="$district" />
            <br />
          </xsl:otherwise>
        </xsl:choose>
        <xsl:if test="string($county)">
          <xsl:value-of select="$county" />
          <xsl:text>&#160;</xsl:text>
          <xsl:value-of select="$n" />
        </xsl:if>
        <xsl:choose>
          <xsl:when test="not(string($postocde))">
            <br />
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="$postocde" />
            <br />
          </xsl:otherwise>
        </xsl:choose>
        <xsl:if test="string($country)">
          <xsl:value-of select="$country" />
          <xsl:value-of select="$n" />
        </xsl:if>
      </xsl:when>
      <xsl:otherwise>
        <xsl:if test="string($pobox)">
          <xsl:value-of select="$pobox" />
          <br />
          <xsl:value-of select="$n" />
        </xsl:if>
        <xsl:if test="string($postocde)">
          <xsl:value-of select="$postocde" />
          <xsl:text>&#160;</xsl:text>
          <xsl:value-of select="$n" />
        </xsl:if>
        <xsl:if test="string($city)">
          <xsl:value-of select="$city" />
          <xsl:text>&#160;</xsl:text>
          <xsl:value-of select="$n" />
        </xsl:if>
        <xsl:choose>
          <xsl:when test="not(string($district))">
            <br />
          </xsl:when>
          <xsl:otherwise>
            <xsl:value-of select="$district" />
            <br />
          </xsl:otherwise>
        </xsl:choose>
        <xsl:if test="string($county)">
          <xsl:value-of select="$county" />
          <br />
          <xsl:value-of select="$n" />
        </xsl:if>
        <xsl:if test="string($country)">
          <xsl:value-of select="$country" />
          <xsl:value-of select="$n" />
        </xsl:if>
      </xsl:otherwise>
    </xsl:choose>
    <p>
      <xsl:value-of select="$n" />
    </p>
    <xsl:apply-templates select="janes:dataGroup" />
    <p />
  </xsl:template>

  <!-- ************************************ -->

  <xsl:template name="lookupname">
    <xsl:param name="lookupname" />
    <xsl:choose>
      <xsl:when test="$lookupname = 'compact name'">
        <xsl:text>Compact Name</xsl:text>
      </xsl:when>
      <xsl:when test="$lookupname = 'alternative name'">
        <xsl:text>Alternative Name</xsl:text>
      </xsl:when>
      <xsl:when test="$lookupname = 'previous name'">
        <xsl:text>Previous Name</xsl:text>
      </xsl:when>
      <xsl:when test="$lookupname = 'stock market name'">
        <xsl:text>Stock Market Name</xsl:text>
      </xsl:when>
      <xsl:when test="$lookupname = 'index name'">
        <xsl:text>Index Name</xsl:text>
      </xsl:when>
      <xsl:when test="$lookupname = 'local language name'">
        <xsl:text>Local Language Name</xsl:text>
      </xsl:when>
      <xsl:when test="$lookupname = 'trading name'">
        <xsl:text>Trading Name</xsl:text>
      </xsl:when>
      <xsl:otherwise />
    </xsl:choose>
  </xsl:template>

  <xsl:template name="lookupNames">
    <xsl:param name="lookupname" />
    <xsl:choose>
      <xsl:when test="$lookupname = 'compact name'">
        <xsl:text>Compact Names</xsl:text>
      </xsl:when>
      <xsl:when test="$lookupname = 'alternative name'">
        <xsl:text>Alternative Names</xsl:text>
      </xsl:when>
      <xsl:when test="$lookupname = 'previous name'">
        <xsl:text>Previous Names</xsl:text>
      </xsl:when>
      <xsl:when test="$lookupname = 'stock market name'">
        <xsl:text>Stock Market Names</xsl:text>
      </xsl:when>
      <xsl:when test="$lookupname = 'index name'">
        <xsl:text>Index Names</xsl:text>
      </xsl:when>
      <xsl:when test="$lookupname = 'local language name'">
        <xsl:text>Local Language Names</xsl:text>
      </xsl:when>
      <xsl:when test="$lookupname = 'trading name'">
        <xsl:text>Trading Names</xsl:text>
      </xsl:when>
      <xsl:otherwise />
    </xsl:choose>
  </xsl:template>

  <xsl:template name="createNames_plural">
    <xsl:param name="my_name" />
    <xsl:param name="my_name_value" />
    <xsl:param name="my_name_Abbr" />
    <xsl:variable name="previous_sib" select="preceding-sibling::janes:para[1]/@qualifier" />
    <xsl:variable name="previous_sib_name" select="following-sibling::janes:para[1]/janes:label[@qualifier='Name']" />
    <h2>
      <xsl:call-template name="lookupNames">
        <xsl:with-param name="lookupname" select="$my_name" />
      </xsl:call-template>
    </h2>
    <xsl:text>&#160;&#160;&#160;</xsl:text>
    <xsl:value-of select="$my_name_value" />
    <xsl:choose>
      <xsl:when test="$my_name_Abbr !=''">
        <xsl:text> (</xsl:text>
        <xsl:value-of select="$my_name_Abbr" />
        <xsl:text>)</xsl:text>
        <br />
        <xsl:value-of select="$n" />
      </xsl:when>
      <xsl:otherwise>
        <br />
        <xsl:value-of select="$n" />
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- ************************************ -->
  <xsl:template name="createNames">
    <xsl:param name="my_name" />
    <xsl:param name="my_name_value" />
    <xsl:param name="my_name_Abbr" />
    <xsl:variable name="previous_sib" select="preceding-sibling::janes:para[1]/@qualifier" />
    <xsl:variable name="previous_sib_name" select="following-sibling::janes:para[1]/janes:label[@qualifier='Name']" />
    <xsl:choose>
      <xsl:when test="$previous_sib = $my_name">
        <xsl:choose>
          <xsl:when test="$my_name = 'compact name'">
            <xsl:text>&#160;&#160;&#160;</xsl:text>
            <xsl:value-of select="$my_name_value" />
          </xsl:when>
          <xsl:when test="$my_name = 'alternative name'">
            <xsl:text>&#160;&#160;&#160;</xsl:text>
            <xsl:value-of select="$my_name_value" />
          </xsl:when>
          <xsl:when test="$my_name = 'previous name'">
            <xsl:text>&#160;&#160;&#160;</xsl:text>
            <xsl:value-of select="$my_name_value" />
          </xsl:when>
          <xsl:when test="$my_name = 'compact name'">
            <xsl:text>&#160;&#160;&#160;</xsl:text>
            <xsl:value-of select="$my_name_value" />
          </xsl:when>
          <xsl:when test="$my_name = 'stock market name'">
            <xsl:text>&#160;&#160;&#160;</xsl:text>
            <xsl:value-of select="$my_name_value" />
          </xsl:when>
          <xsl:when test="$my_name = 'index name'">
            <xsl:text>&#160;&#160;&#160;</xsl:text>
            <xsl:value-of select="$my_name_value" />
          </xsl:when>
          <xsl:when test="$my_name = 'local language name'">
            <xsl:text>&#160;&#160;&#160;</xsl:text>
            <xsl:value-of select="$my_name_value" />
          </xsl:when>
          <xsl:when test="$my_name = 'trading name'">
            <xsl:text>&#160;&#160;&#160;&#160;</xsl:text>
            <xsl:value-of select="$my_name_value" />
          </xsl:when>
          <xsl:otherwise />
        </xsl:choose>
        <br />
        <xsl:value-of select="$n" />
      </xsl:when>
      <xsl:otherwise>
        <h2>
          <xsl:call-template name="lookupname">
            <xsl:with-param name="lookupname" select="$my_name" />
          </xsl:call-template>
        </h2>
        <xsl:value-of select="$my_name_value" />
        <xsl:choose>
          <xsl:when test="$my_name_Abbr !=''">
            <xsl:text> (</xsl:text>
            <xsl:value-of select="$my_name_Abbr" />
            <xsl:text>)</xsl:text>
            <br />
            <xsl:value-of select="$n" />
          </xsl:when>
          <xsl:otherwise>
            <br />
            <xsl:value-of select="$n" />
          </xsl:otherwise>
        </xsl:choose>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- ************************************ -->
  <xsl:template match="janes:para[@qualifier='compact name']">
    <xsl:choose>
      <xsl:when test="following-sibling::janes:para[1][@qualifier ='compact name'] and (not(preceding-sibling::janes:para[1]) or preceding-sibling::janes:para[1][not(@qualifier ='compact name')])">
        <xsl:call-template name="createNames_plural">
          <xsl:with-param name="my_name" select="@qualifier" />
          <xsl:with-param name="my_name_value" select="./janes:label[@qualifier='Name']" />
          <xsl:with-param name="my_name_Abbr" select="./janes:label[@qualifier='Abbr']" />
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:call-template name="createNames">
          <xsl:with-param name="my_name" select="@qualifier" />
          <xsl:with-param name="my_name_value" select="./janes:label[@qualifier='Name']" />
          <xsl:with-param name="my_name_Abbr" select="./janes:label[@qualifier='Abbr']" />
        </xsl:call-template>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  <!-- ************************************ -->
  <xsl:template match="janes:para[@qualifier='alternative name']">
    <xsl:choose>
      <xsl:when test="following-sibling::janes:para[1][@qualifier ='alternative name'] and (not(preceding-sibling::janes:para[1]) or preceding-sibling::janes:para[1][not(@qualifier ='alternative name')])">
        <xsl:call-template name="createNames_plural">
          <xsl:with-param name="my_name" select="@qualifier" />
          <xsl:with-param name="my_name_value" select="./janes:label[@qualifier='Name']" />
          <xsl:with-param name="my_name_Abbr" select="./janes:label[@qualifier='Abbr']" />
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:call-template name="createNames">
          <xsl:with-param name="my_name" select="@qualifier" />
          <xsl:with-param name="my_name_value" select="./janes:label[@qualifier='Name']" />
          <xsl:with-param name="my_name_Abbr" select="./janes:label[@qualifier='Abbr']" />
        </xsl:call-template>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- ************************************ -->
  <xsl:template match="janes:para[@qualifier='previous name']">
    <xsl:choose>
      <xsl:when test="following-sibling::janes:para[1][@qualifier ='previous name'] and (not(preceding-sibling::janes:para[1]) or preceding-sibling::janes:para[1][not(@qualifier ='previous name')])">
        <xsl:call-template name="createNames_plural">
          <xsl:with-param name="my_name" select="@qualifier" />
          <xsl:with-param name="my_name_value" select="./janes:label[@qualifier='Name']" />
          <xsl:with-param name="my_name_Abbr" select="./janes:label[@qualifier='Abbr']" />
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:call-template name="createNames">
          <xsl:with-param name="my_name" select="@qualifier" />
          <xsl:with-param name="my_name_value" select="./janes:label[@qualifier='Name']" />
          <xsl:with-param name="my_name_Abbr" select="./janes:label[@qualifier='Abbr']" />
        </xsl:call-template>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- ************************************ -->
  <xsl:template match="janes:para[@qualifier='stock market name']">
    <xsl:choose>
      <xsl:when test="following-sibling::janes:para[1][@qualifier ='stock market name'] and (not(preceding-sibling::janes:para[1]) or preceding-sibling::janes:para[1][not(@qualifier ='stock market name')])">
        <xsl:call-template name="createNames_plural">
          <xsl:with-param name="my_name" select="@qualifier" />
          <xsl:with-param name="my_name_value" select="./janes:label[@qualifier='Name']" />
          <xsl:with-param name="my_name_Abbr" select="./janes:label[@qualifier='Abbr']" />
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:call-template name="createNames">
          <xsl:with-param name="my_name" select="@qualifier" />
          <xsl:with-param name="my_name_value" select="./janes:label[@qualifier='Name']" />
          <xsl:with-param name="my_name_Abbr" select="./janes:label[@qualifier='Abbr']" />
        </xsl:call-template>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  <!-- ************************************ -->
  <xsl:template match="janes:para[@qualifier='index name']">
    <xsl:choose>
      <xsl:when test="following-sibling::janes:para[1][@qualifier ='index name'] and (not(preceding-sibling::janes:para[1]) or preceding-sibling::janes:para[1][not(@qualifier ='index name')])">
        <xsl:call-template name="createNames_plural">
          <xsl:with-param name="my_name" select="@qualifier" />
          <xsl:with-param name="my_name_value" select="./janes:label[@qualifier='Name']" />
          <xsl:with-param name="my_name_Abbr" select="./janes:label[@qualifier='Abbr']" />
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:call-template name="createNames">
          <xsl:with-param name="my_name" select="@qualifier" />
          <xsl:with-param name="my_name_value" select="./janes:label[@qualifier='Name']" />
          <xsl:with-param name="my_name_Abbr" select="./janes:label[@qualifier='Abbr']" />
        </xsl:call-template>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  <!-- ************************************ -->
  <xsl:template match="janes:para[@qualifier='local language name']">
    <xsl:choose>
      <xsl:when test="following-sibling::janes:para[1][@qualifier ='local language name'] and (not(preceding-sibling::janes:para[1]) or preceding-sibling::janes:para[1][not(@qualifier ='local language name')])">
        <xsl:call-template name="createNames_plural">
          <xsl:with-param name="my_name" select="@qualifier" />
          <xsl:with-param name="my_name_value" select="./janes:label[@qualifier='Name']" />
          <xsl:with-param name="my_name_Abbr" select="./janes:label[@qualifier='Abbr']" />
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:call-template name="createNames">
          <xsl:with-param name="my_name" select="@qualifier" />
          <xsl:with-param name="my_name_value" select="./janes:label[@qualifier='Name']" />
          <xsl:with-param name="my_name_Abbr" select="./janes:label[@qualifier='Abbr']" />
        </xsl:call-template>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  <!-- ************************************ -->
  <xsl:template match="janes:para[@qualifier='trading name']">
    <xsl:choose>
      <xsl:when test="following-sibling::janes:para[1][@qualifier ='trading name'] and (not(preceding-sibling::janes:para[1]) or preceding-sibling::janes:para[1][not(@qualifier ='trading name')])">
        <xsl:call-template name="createNames_plural">
          <xsl:with-param name="my_name" select="@qualifier" />
          <xsl:with-param name="my_name_value" select="./janes:label[@qualifier='Name']" />
          <xsl:with-param name="my_name_Abbr" select="./janes:label[@qualifier='Abbr']" />
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:call-template name="createNames">
          <xsl:with-param name="my_name" select="@qualifier" />
          <xsl:with-param name="my_name_value" select="./janes:label[@qualifier='Name']" />
          <xsl:with-param name="my_name_Abbr" select="./janes:label[@qualifier='Abbr']" />
        </xsl:call-template>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  <!-- ************************************ -->

  <!-- ****** ORGANISATION COMMUNICATION ******************************************************************************************************************************************************************************** -->

  <!-- ******************************************** -->

  <xsl:template match="janes:para[@qualifier='Cable']" priority="1">
    <xsl:call-template name="createOrgCode">
      <xsl:with-param name="my_qualifier" select="@qualifier" />
    </xsl:call-template>
  </xsl:template>

  <!-- ******************************************** -->

  <xsl:template match="janes:dataGroup[@qualifier='orgCom']/janes:para[@qualifier='Sita']" priority="1">
    <xsl:call-template name="createOrgCode">
      <xsl:with-param name="my_qualifier" select="@qualifier" />
    </xsl:call-template>
  </xsl:template>

  <!-- ******************************************** -->

  <xsl:template match="janes:dataGroup[@qualifier='orgCom']/janes:para[@qualifier='AFTN code']" priority="1">
    <xsl:call-template name="createOrgCode">
      <xsl:with-param name="my_qualifier" select="@qualifier" />
    </xsl:call-template>
  </xsl:template>
  <!-- ******************************************** -->

  <xsl:template match="janes:dataGroup[@qualifier='orgCom']/janes:para[@qualifier='Radio Code']" priority="1">
    <xsl:call-template name="createOrgCode">
      <xsl:with-param name="my_qualifier" select="@qualifier" />
    </xsl:call-template>
  </xsl:template>

  <!-- ******************************************** -->

  <xsl:template match="janes:dataGroup[@qualifier='orgCom']/janes:para[@qualifier='Teletext']" priority="1">
    <xsl:call-template name="createOrgCode">
      <xsl:with-param name="my_qualifier" select="@qualifier" />
    </xsl:call-template>
  </xsl:template>

  <!-- ******************************************** -->

  <xsl:template match="janes:dataGroup[@qualifier='orgCom']/janes:para[@qualifier='e-mail']" priority="1">
    <xsl:call-template name="createOrgCode">
      <xsl:with-param name="my_qualifier" select="@qualifier" />
    </xsl:call-template>
  </xsl:template>

  <!-- ******************************************** -->
  <xsl:template match="janes:dataGroup[@qualifier='orgCom']/janes:para[@qualifier='Web']" priority="1">
    <xsl:call-template name="createWebCode">
      <xsl:with-param name="my_qualifier" select="@qualifier" />
    </xsl:call-template>
  </xsl:template>

  <!-- ******************************************** -->

  <xsl:template match="janes:dataGroup[@qualifier='orgCom']/janes:para[@qualifier='ftp']" priority="1">
    <xsl:call-template name="createOrgCode">
      <xsl:with-param name="my_qualifier" select="@qualifier" />
    </xsl:call-template>
  </xsl:template>

  <!-- ******************************************** -->

  <xsl:template match="janes:dataGroup[@qualifier='orgCom']/janes:para[@qualifier='CompuServe']" priority="1">
    <xsl:call-template name="createOrgCode">
      <xsl:with-param name="my_qualifier" select="@qualifier" />
    </xsl:call-template>
  </xsl:template>

  <!-- ******************************************** -->

  <xsl:template match="janes:dataGroup[@qualifier='orgCom']/janes:para[@qualifier='Satcom']" priority="1">
    <xsl:call-template name="createOrgCode">
      <xsl:with-param name="my_qualifier" select="@qualifier" />
    </xsl:call-template>
  </xsl:template>

  <!-- ******************************************** -->

  <xsl:template match="janes:dataGroup[@qualifier='orgCom']/janes:para[@qualifier='Aircom']" priority="1">
    <xsl:call-template name="createOrgCode">
      <xsl:with-param name="my_qualifier" select="@qualifier" />
    </xsl:call-template>
  </xsl:template>

  <!-- * Telex ******************************************* -->

  <xsl:template match="janes:dataGroup[@qualifier='orgCom']/janes:para[@qualifier='Telex']" priority="1">
    <xsl:call-template name="createOrgCode">
      <xsl:with-param name="my_qualifier" select="@qualifier" />
    </xsl:call-template>
  </xsl:template>

  <!-- ******************************************************************************************* -->

  <xsl:template name="createWebCode">
    <xsl:param name="my_qualifier" />
    <xsl:variable name="www" select="preceding-sibling::janes:para[1]/@qualifier" />
    <xsl:variable name="previous_sib" select="preceding-sibling::janes:para[1]/@qualifier" />
    <xsl:choose>
      <xsl:when test="position()>1">
        <xsl:if test="$previous_sib = $my_qualifier">
          <xsl:choose>
            <xsl:when test="$my_qualifier ='Web'">
              <xsl:text>&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;</xsl:text>
            </xsl:when>
            <xsl:otherwise>
            </xsl:otherwise>
          </xsl:choose>
          <a href="http://{./janes:label[@qualifier='value']}">
            <xsl:value-of select="./janes:label[@qualifier='value']" />
          </a>
          <xsl:value-of select="$n" />
          <xsl:choose>
            <xsl:when test=".//janes:label[@qualifier='qualification'] !=''">
              <xsl:text>(</xsl:text>
              <xsl:value-of select="./janes:label[@qualifier='qualification']" />
              <xsl:text>)</xsl:text>
              <br />
              <xsl:value-of select="$n" />
            </xsl:when>
            <xsl:otherwise>
              <br />
            </xsl:otherwise>
          </xsl:choose>
        </xsl:if>
        <xsl:if test="$previous_sib != $my_qualifier">
          <b>
            <xsl:call-template name="lookup_2">
              <xsl:with-param name="lookup" select="$my_qualifier" />
            </xsl:call-template>
          </b>
          <a href="http://{./janes:label[@qualifier='value']}">
            <xsl:value-of select="./janes:label[@qualifier='value']" />
          </a>
          <xsl:value-of select="$n" />
          <xsl:value-of select="$n" />
          <xsl:choose>
            <xsl:when test=".//janes:label[@qualifier='qualification'] !=''">
              <xsl:text>(</xsl:text>
              <xsl:value-of select="./janes:label[@qualifier='qualification']" />
              <xsl:text>)</xsl:text>
              <br />
              <xsl:value-of select="$n" />
            </xsl:when>
            <xsl:otherwise>
              <br />
            </xsl:otherwise>
          </xsl:choose>
        </xsl:if>
      </xsl:when>
      <xsl:otherwise />
    </xsl:choose>
  </xsl:template>

  <!-- ******************************************************************************************* -->

  <xsl:template name="createKPWebCode">
    <xsl:param name="my_qualifier" />
    <xsl:variable name="www" select="preceding-sibling::janes:para[1]/@qualifier" />
    <xsl:variable name="previous_sib" select="preceding-sibling::janes:para[1]/@qualifier" />
    <xsl:choose>
      <xsl:when test="position()>1">
        <xsl:if test="$previous_sib = $my_qualifier">
          <xsl:choose>
            <xsl:when test="$my_qualifier ='Web'">
              <xsl:text>&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;</xsl:text>
            </xsl:when>
            <xsl:otherwise>
            </xsl:otherwise>
          </xsl:choose>
          <a href="http://{./janes:label[@qualifier='value']}">
            <xsl:value-of select="./janes:label[@qualifier='value']" />
          </a>
          <xsl:value-of select="$n" />
          <xsl:choose>
            <xsl:when test=".//janes:label[@qualifier='qualification'] !=''">
              <xsl:text>(</xsl:text>
              <xsl:value-of select="./janes:label[@qualifier='qualification']" />
              <xsl:text>)</xsl:text>
              <br />
              <xsl:value-of select="$n" />
            </xsl:when>
            <xsl:otherwise>
              F<br />
            </xsl:otherwise>
          </xsl:choose>
        </xsl:if>
        <xsl:if test="$previous_sib != $my_qualifier">
          <b>
            <xsl:call-template name="lookup">
              <xsl:with-param name="lookup" select="$my_qualifier" />
            </xsl:call-template>
          </b>
          <a href="http://{./janes:label[@qualifier='value']}">
            <xsl:value-of select="./janes:label[@qualifier='value']" />
          </a>
          <xsl:value-of select="$n" />
          <xsl:value-of select="$n" />
          <xsl:choose>
            <xsl:when test=".//janes:label[@qualifier='qualification'] !=''">
              <xsl:text>(</xsl:text>
              <xsl:value-of select="./janes:label[@qualifier='qualification']" />
              <xsl:text>)</xsl:text>
              <xsl:value-of select="$n" />
            </xsl:when>
            <xsl:otherwise>
              R<br />
            </xsl:otherwise>
          </xsl:choose>
        </xsl:if>
      </xsl:when>
      <xsl:otherwise />
    </xsl:choose>
  </xsl:template>

  <!-- ******************************************************************************************* -->

  <xsl:template name="createOrgCode">
    <xsl:param name="my_qualifier" />
    <xsl:variable name="previous_sib" select="preceding-sibling::janes:para[1]/@qualifier" />
    <xsl:choose>
      <xsl:when test="position()>1">
        <xsl:if test="$previous_sib = $my_qualifier">
          <xsl:choose>
            <xsl:when test="$my_qualifier ='e-mail'">
              <xsl:text>&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;</xsl:text>
            </xsl:when>
            <xsl:otherwise>
            </xsl:otherwise>
          </xsl:choose>
          <xsl:value-of select="./janes:label[@qualifier='value']" />
          <xsl:value-of select="$n" />
          <xsl:choose>
            <xsl:when test=".//janes:label[@qualifier='qualification'] !=''">
              <xsl:text>(</xsl:text>
              <xsl:value-of select="./janes:label[@qualifier='qualification']" />
              <xsl:text>)</xsl:text>
              <br />
              <xsl:value-of select="$n" />
            </xsl:when>
            <xsl:otherwise>
              <br />
            </xsl:otherwise>
          </xsl:choose>
        </xsl:if>
        <xsl:if test="$previous_sib != $my_qualifier">
          <b>
            <xsl:call-template name="lookup_1">
              <xsl:with-param name="lookup" select="$my_qualifier" />
            </xsl:call-template>
          </b>
          <xsl:value-of select="./janes:label[@qualifier='value']" />
          <xsl:value-of select="$n" />
          <xsl:value-of select="$n" />
          <xsl:choose>
            <xsl:when test=".//janes:label[@qualifier='qualification'] !=''">
              <xsl:text>(</xsl:text>
              <xsl:value-of select="./janes:label[@qualifier='qualification']" />
              <xsl:text>)</xsl:text>
              <br />
              <xsl:value-of select="$n" />
            </xsl:when>
            <xsl:otherwise>
              <br />
            </xsl:otherwise>
          </xsl:choose>
        </xsl:if>
      </xsl:when>
      <xsl:otherwise />
    </xsl:choose>
  </xsl:template>

  <!-- ******************************************************************************************* -->

  <!-- * Telephone ******************************************* -->

  <xsl:template match="janes:dataGroup[@qualifier='orgCom']/janes:para[@qualifier='Telephone']" priority="1">
    <xsl:call-template name="createTelephone">
      <xsl:with-param name="my_qualifier" select="@qualifier" />
    </xsl:call-template>
  </xsl:template>

  <!-- * Fax ******************************************* -->
  <xsl:template match="janes:dataGroup[@qualifier='orgCom']/janes:para[@qualifier='Fax']" priority="1">
    <xsl:call-template name="createTelephone">
      <xsl:with-param name="my_qualifier" select="@qualifier" />
    </xsl:call-template>
  </xsl:template>

  <!-- * Mobile ******************************************* -->

  <xsl:template match="janes:dataGroup[@qualifier='orgCom']/janes:para[@qualifier='Mobile']" priority="1">
    <xsl:call-template name="createTelephone">
      <xsl:with-param name="my_qualifier" select="@qualifier" />
    </xsl:call-template>
  </xsl:template>

  <!-- * Freephone ******************************************* -->

  <xsl:template match="janes:dataGroup[@qualifier='orgCom']/janes:para[@qualifier='Freephone']" priority="1">
    <xsl:call-template name="createTelephone">
      <xsl:with-param name="my_qualifier" select="@qualifier" />
    </xsl:call-template>
  </xsl:template>

  <!-- ******************************************** -->

  <xsl:template name="lookup">
    <xsl:param name="lookup" />
    <xsl:choose>
      <xsl:when test="$lookup = 'Fax'">
        <xsl:text>Fax: </xsl:text>
      </xsl:when>
      <xsl:when test="$lookup = 'Freephone'">
        <xsl:text>Freephone: </xsl:text>
      </xsl:when>
      <xsl:when test="$lookup = 'Mobile'">
        <xsl:text>Mobile: </xsl:text>
      </xsl:when>
      <xsl:when test="$lookup = 'Telephone'">
        <xsl:text>Tel: </xsl:text>
      </xsl:when>
      <xsl:when test="$lookup = 'Telex'">
        <xsl:text>Telex: </xsl:text>
      </xsl:when>
      <xsl:when test="$lookup = 'Web'">
        <xsl:text>Web: </xsl:text>
      </xsl:when>
      <xsl:otherwise />
    </xsl:choose>
  </xsl:template>

  <xsl:template name="lookup_1">
    <xsl:param name="lookup" />
    <xsl:choose>
      <xsl:when test="$lookup = 'Telex'">
        <xsl:text>Telex: </xsl:text>
      </xsl:when>
      <xsl:when test="$lookup = 'AFTN code'">
        <xsl:text>ATFN: </xsl:text>
      </xsl:when>
      <xsl:when test="$lookup = 'e-mail'">
        <xsl:text>E-mail: </xsl:text>
      </xsl:when>
      <xsl:when test="$lookup = 'Sita'">
        <xsl:text>Sita: </xsl:text>
      </xsl:when>
      <xsl:when test="$lookup = 'Radio Code'">
        <xsl:text>Radio Code: </xsl:text>
      </xsl:when>
      <xsl:when test="$lookup = 'ftp'">
        <xsl:text>FTP: </xsl:text>
      </xsl:when>
      <xsl:when test="$lookup = 'CompuServe'">
        <xsl:text>CompuServe: </xsl:text>
      </xsl:when>
      <xsl:when test="$lookup = 'Satcom'">
        <xsl:text>Satcom: </xsl:text>
      </xsl:when>
      <xsl:when test="$lookup = 'Aircom'">
        <xsl:text>Aircom: </xsl:text>
      </xsl:when>
      <xsl:when test="$lookup = 'Teletext'">
        <xsl:text>Teletext: </xsl:text>
      </xsl:when>
      <xsl:when test="$lookup = 'Cable'">
        <xsl:text>Cable: </xsl:text>
      </xsl:when>
      <xsl:otherwise />
    </xsl:choose>
  </xsl:template>

  <xsl:template name="lookup_2">
    <xsl:param name="lookup" />
    <xsl:choose>
      <xsl:when test="$lookup = 'Web'">
        <xsl:text>Web: </xsl:text>
      </xsl:when>
      <xsl:otherwise />
    </xsl:choose>
  </xsl:template>

  <xsl:template name="createTelephone">
    <xsl:param name="my_qualifier" />
    <xsl:variable name="previous_sib" select="preceding-sibling::janes:para[1]/@qualifier" />

    <xsl:choose>
      <xsl:when test="$previous_sib = $my_qualifier">
        <xsl:choose>
          <xsl:when test="$my_qualifier ='Telephone'">
            <xsl:text>&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;(+</xsl:text>
          </xsl:when>
          <xsl:when test="$my_qualifier ='Fax'">
            <xsl:text>&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;(+</xsl:text>
          </xsl:when>
          <xsl:when test="$my_qualifier ='Freephone'">
            <xsl:text>&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;(+</xsl:text>
          </xsl:when>
          <xsl:when test="$my_qualifier ='Telex'">
            <xsl:text>&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;(+</xsl:text>
          </xsl:when>
          <xsl:when test="$my_qualifier ='Mobile'">
            <xsl:text>&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;&#160;(+</xsl:text>
          </xsl:when>
          <xsl:otherwise>
          </xsl:otherwise>
        </xsl:choose>
        <xsl:value-of select="./janes:label[@qualifier='intlCode']" />
        <xsl:text>&#160;</xsl:text>
        <xsl:value-of select="./janes:label[@qualifier='areaCode']" />
        <xsl:text>) </xsl:text>
        <xsl:value-of select="./janes:label[@qualifier='value']" />
        <xsl:value-of select="$n" />
        <xsl:choose>
          <xsl:when test=".//janes:label[@qualifier='qualification'] !=''">
            <xsl:text>(</xsl:text>
            <xsl:value-of select="./janes:label[@qualifier='qualification']" />
            <xsl:text>)</xsl:text>
            <br />
            <xsl:value-of select="$n" />
          </xsl:when>
          <xsl:otherwise>
            <br />
          </xsl:otherwise>
        </xsl:choose>
      </xsl:when>
      <xsl:otherwise>
        <b>
          <xsl:call-template name="lookup">
            <xsl:with-param name="lookup" select="$my_qualifier" />
          </xsl:call-template>
        </b>
        <xsl:text>(+</xsl:text>
        <xsl:value-of select="./janes:label[@qualifier='intlCode']" />
        <xsl:text>&#160;</xsl:text>
        <xsl:value-of select="./janes:label[@qualifier='areaCode']" />
        <xsl:text>) </xsl:text>
        <xsl:value-of select="./janes:label[@qualifier='value']" />
        <xsl:value-of select="$n" />
        <xsl:choose>
          <xsl:when test=".//janes:label[@qualifier='qualification'] !=''">
            <xsl:text>(</xsl:text>
            <xsl:value-of select="./janes:label[@qualifier='qualification']" />
            <xsl:text>)</xsl:text>
            <br />
            <xsl:value-of select="$n" />
          </xsl:when>
          <xsl:otherwise>
            <br />
          </xsl:otherwise>
        </xsl:choose>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="recordDetails">
    <xsl:param name="sectionValue" />
    <!-- AUTHOR -->
    <xsl:if test="not(normalize-space(janes:record//janes:authorName)='')">
      <p class="u-bold u-padding-Txxs u-margin-Bxxs">Author</p>
      <xsl:for-each select="janes:record/janes:authoredBy/janes:author">
        <xsl:if test="preceding-sibling::janes:author">
          <br />
        </xsl:if>
        <p>
          <span>
            <xsl:apply-templates select="janes:authorName" />
          </span>
          <span>
            <xsl:apply-templates select="janes:publication" />
            <xsl:apply-templates select="janes:position" />
            <xsl:apply-templates select="janes:groupName" />
            <span>
              <xsl:apply-templates select="janes:site" />
            </span>
            <span>
              <xsl:apply-templates select="janes:contact" />
            </span>
          </span>
        </p>
      </xsl:for-each>
    </xsl:if>
    <!-- /AUTHOR -->
    <!-- SECTION -->
    <xsl:if test="not($sectionValue='')">
      <p class="u-bold u-padding-Txxs u-margin-Bxxs">Section</p>
      <p>
        <xsl:value-of select="$sectionValue" />
      </p>
    </xsl:if>
    <!-- /SECTION -->

    <!-- COUNTRIES -->
    <xsl:if test="not(normalize-space($meta/jm:country/jm:standardName)='')">
      <xsl:choose>
        <xsl:when test="count($meta/jm:country/jm:standardName) &gt; 1">
          <p class="u-bold u-padding-Txxs u-margin-Bxxs">Countries</p>
        </xsl:when>
        <xsl:otherwise>
          <p class="u-bold u-padding-Txxs u-margin-Bxxs">Country</p>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:for-each select="$meta/jm:country/jm:standardName">
        <p>
          <xsl:value-of select="." />
          <xsl:if test="
										../jm:context[not(normalize-space(jm:standardName) = '' or
										normalize-space(jm:standardName)='eDocHeader' or
										normalize-space(jm:standardName)='print index' or
										normalize-space(jm:standardName)='eIndex'
										)]">
            <xsl:text> (</xsl:text>
            <xsl:for-each select="../jm:context/jm:standardName
															[normalize-space(.)!='eDocHeader' and
															normalize-space(.)!='print index' and
															normalize-space(.)!='eIndex']
													">
              <xsl:if test="position() &gt; 1">
                <xsl:text> | </xsl:text>
              </xsl:if>
              <xsl:value-of select="normalize-space(.)" />
            </xsl:for-each>
            <xsl:text>)</xsl:text>
          </xsl:if>
        </p>
      </xsl:for-each>
    </xsl:if>
    <!-- /COUNTRIES -->
    <!-- COMPANY -->
    <xsl:if test="$meta/jm:organisation[normalize-space(jm:standardName) != ''] and not (normalize-space (janes:record/janes:title[1]) = normalize-space (($meta/jm:organisation/jm:standardName)[1]))">
      <p class="u-bold u-padding-Txxs u-margin-Bxxs">Organisation</p>
      <xsl:for-each select="$meta/jm:organisation/jm:standardName">
        <p>
          <xsl:value-of select="." />
        </p>
      </xsl:for-each>
    </xsl:if>
    <!-- /COMPANY -->

    <!-- POST DATE-->
    <p class="u-bold u-padding-Txxs u-margin-Bxxs">Date posted</p>
    <xsl:choose>
      <xsl:when test="$metaSubject[@qualifier='updateStatus']='Archived'">
        <p class="red1">
          <xsl:value-of select="concat($day, '-', $month, '-', $year)" />
        </p>
      </xsl:when>
      <xsl:otherwise>
        <p>
          <xsl:value-of select="concat($day, '-', $month, '-', $year)" />
        </p>
      </xsl:otherwise>
    </xsl:choose>
    <!-- /POST DATE -->

    <!-- UPDATE STATUS -->
    <xsl:if test="count($metaSubject[@qualifier='updateStatus'])&gt;0 and string($metaSubject[@qualifier='updateStatus']) !=''">
      <p class="u-bold u-padding-Txxs u-margin-Bxxs">Update status</p>
      <xsl:choose>
        <xsl:when test="$metaSubject[@qualifier='updateStatus']='Archived'">
          <p class="red1">
            <xsl:attribute name="class">red1</xsl:attribute>
            <xsl:value-of select="$metaSubject[@qualifier='updateStatus']" />
          </p>
        </xsl:when>
        <xsl:otherwise>
          <p>
            <xsl:value-of select="$metaSubject[@qualifier='updateStatus']" />
          </p>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:if>
    <!-- /UPDATE STATUS -->

    <!-- IMAGE COUNT -->
    <xsl:if test="count(//janes:mediaBlock)&gt;0">
      <p class="u-bold u-padding-Txxs u-margin-Bxxs">Images</p>
      <p>
        <xsl:if test="$metaSubject[@qualifier='updateStatus']='Archived'">
          <xsl:attribute name="class">red1</xsl:attribute>
        </xsl:if>
        <a href='#blockImage'>
          <xsl:value-of select="count(//janes:mediaBlock)" />
          <xsl:text> image</xsl:text>
          <xsl:if test="count(//janes:mediaBlock)&gt;1">
            <xsl:text>s</xsl:text>
          </xsl:if>
        </a>
      </p>
    </xsl:if>
    <!-- /IMAGE COUNT -->
  </xsl:template>

  <xsl:template match="jm:equipment[@mode = 'baseModel']">
    <xsl:call-template name="builddictline">
      <xsl:with-param name="number">
        <xsl:value-of select="count(ancestor::jm:equipment[@mode = 'baseModel']) + 1" />
      </xsl:with-param>
      <xsl:with-param name="label">
        <xsl:text>Base Model</xsl:text>
      </xsl:with-param>
    </xsl:call-template>
    <xsl:apply-templates select="jm:equipment" />
  </xsl:template>

  <xsl:template match="jm:equipment[@mode = 'variant']">
    <xsl:param name="number" />

    <xsl:call-template name="builddictline">
      <xsl:with-param name="number">
        <xsl:value-of select="count(ancestor::jm:equipment[@mode = 'baseModel']) + 1" />
      </xsl:with-param>
      <xsl:with-param name="label">
        <xsl:value-of select="concat('Variant of ', parent::jm:equipment/jm:standardName)" />
      </xsl:with-param>
    </xsl:call-template>
    <xsl:apply-templates select="jm:equipment">
    </xsl:apply-templates>
  </xsl:template>

  <xsl:template name="builddictline">
    <xsl:param name="number" />
    <xsl:param name="label">Base Model</xsl:param>
    <tr>
      <td>
        <xsl:attribute name="title">
          <xsl:value-of select="$label" />
        </xsl:attribute>
        <xsl:value-of select="jm:standardName" />
      </td>
      <td>
        <xsl:value-of select="jm:classification[@qualifier='primary'][@taxonomy='Class Hierarchy'][1]/jm:standardName" />
      </td>
      <td>
        <xsl:for-each select="jm:organisation[jm:context/jm:standardName='manufacturer']">
          <xsl:value-of select="jm:alias" />
          <xsl:if test="not(position() = last())">
            <xsl:text>|</xsl:text>
          </xsl:if>
        </xsl:for-each>
        <xsl:if test="jm:alias[not(@processed='prependContractor')]">
          <xsl:text> (</xsl:text>
          <xsl:for-each select="jm:alias[not(@processed='prependContractor')]">
            <xsl:value-of select="." />
            <xsl:if test="@designation and not(@designation = '')">
              <xsl:element name="em">
                <xsl:text>&#160;</xsl:text>
                <xsl:value-of select="@designation" />
              </xsl:element>
            </xsl:if>
          </xsl:for-each>
          <xsl:text>)</xsl:text>
        </xsl:if>
      </td>
    </tr>
  </xsl:template>

  <!-- ********* ORG FINANCE ***************************************************************************************************************************************************************************** -->

  <xsl:template match="janes:dataGroup[@qualifier='orgFinance']">
    <xsl:if test="preceding-sibling::janes:dataGroup[1][@qualifier='orgCom']">
      <p />
    </xsl:if>
    <xsl:value-of select="$n" />
    <xsl:value-of select="$n" />
    <xsl:value-of select="$n" />
    <xsl:value-of select="$n" />
    <xsl:for-each select="janes:para[1]">
      <b>
        <xsl:value-of select="@qualifier" />
        <xsl:text>: </xsl:text>
      </b>
      <xsl:value-of select="./janes:label[@qualifier='localCurrency']" />
      <xsl:value-of select=".//janes:label[@qualifier='localValue']" />
      <xsl:text>&#160;</xsl:text>
      <xsl:variable name="toDate" select="substring(.//janes:label[@qualifier='toDate'],8,4)" />
      <xsl:variable name="fromSDate" select="substring(.//janes:label[@qualifier='fromDate'],8,4)" />
      <xsl:choose>
        <xsl:when test="$fromSDate = $toDate">
          <xsl:text>(</xsl:text>
          <xsl:value-of select="$fromSDate" />
          <xsl:text>) </xsl:text>
        </xsl:when>
        <xsl:otherwise>
          <xsl:text>(</xsl:text>
          <xsl:value-of select="$fromSDate" />
          <xsl:text>/</xsl:text>
          <xsl:value-of select="substring($toDate,3,2)" />
          <xsl:text>)</xsl:text>
          <xsl:value-of select="$n" />
        </xsl:otherwise>
      </xsl:choose>
      <xsl:if test=".//janes:label[@qualifier='qualification'] !=''">
        <xsl:text>&#160;</xsl:text>
        <xsl:value-of select=".//janes:label[@qualifier='qualification']" />
      </xsl:if>
      <br />
    </xsl:for-each>
  </xsl:template>

  <!-- *********** ORG STATS *************************************************************************************************************************************************************************** -->

  <xsl:template match="janes:dataGroup[@qualifier='orgStat']">
    <xsl:for-each select="janes:para[1]">
      <xsl:value-of select="$n" />
      <xsl:value-of select="$n" />
      <br />
      <!-- added this break for corrections -->
      <b>
        <xsl:value-of select="@qualifier" />:
      </b>
      <xsl:value-of select="./janes:label[@qualifier='MetricLoValue']" />
      <xsl:text>&#160;</xsl:text>
      <xsl:value-of select=".//janes:label[@qualifier='MetricUOM']" />
      <xsl:text>&#160;</xsl:text>
      <xsl:variable name="toDate" select="substring(.//janes:label[@qualifier='toDate'],8,4)" />
      <xsl:variable name="fromSDate" select="substring(.//janes:label[@qualifier='fromDate'],8,4)" />
      <xsl:text>(</xsl:text>
      <xsl:choose>
        <xsl:when test="$fromSDate = $toDate">
          <xsl:value-of select="$fromSDate" />
          <xsl:text>)</xsl:text>
          <xsl:value-of select="$n" />
        </xsl:when>
        <xsl:when test="$toDate=''">
          <xsl:value-of select="$fromSDate" />
          <xsl:text>)</xsl:text>
          <xsl:value-of select="$n" />
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="$fromSDate" />
          <xsl:text>/</xsl:text>
          <xsl:value-of select="substring($toDate,3,2)" />
          <xsl:text>)</xsl:text>
          <xsl:value-of select="$n" />
        </xsl:otherwise>
      </xsl:choose>
      <xsl:if test=".//janes:label[@qualifier='qualification'] !=''">
        <xsl:text>(</xsl:text>
        <xsl:value-of select=".//janes:label[@qualifier='qualification']" />
        <xsl:text>, </xsl:text>
      </xsl:if>
    </xsl:for-each>
  </xsl:template>

  <!-- ************************************************************************************************************************************************************************************** -->

  <xsl:template match="janes:dataGroup[@qualifier='keyPersonnel']">
    <xsl:value-of select="$n" />
    <xsl:value-of select="$n" />
    <xsl:value-of select="$n" />
    <h2>Key Personnel</h2>
    <div class="u-overflow-hidden">
      <table class="table table-bordered">
        <caption class="sr-only">Key Personnel</caption>
        <xsl:for-each select="./janes:keyPersonnel">
          <tr>
            <xsl:call-template name="keyPersonnel" />
          </tr>
        </xsl:for-each>
      </table>
    </div>
  </xsl:template>

  <!-- ******************************************** -->

  <xsl:template name="keyPersonnel">
    <xsl:choose>
      <xsl:when test="janes:para">
        <xsl:call-template name="KP_with_comms" />
      </xsl:when>
      <xsl:otherwise>
        <xsl:call-template name="KP_no_comms" />
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- ******************************************** -->

  <xsl:template name="KP_with_comms">
    <td>
      <xsl:value-of select="./janes:doubleList[@qualifier='person']//janes:label[@qualifier='jobTitle']" />
    </td>
    <td>
      <xsl:element name="strong">
        <xsl:value-of select="./janes:doubleList[@qualifier='person']/janes:second//janes:label[@qualifier='title']" />
        <xsl:text>&#160;</xsl:text>
        <xsl:value-of select="./janes:doubleList[@qualifier='person']/janes:second//janes:label[@qualifier='firstName']" />
        <xsl:text>&#160;</xsl:text>
        <xsl:value-of select="./janes:doubleList[@qualifier='person']/janes:second//janes:label[@qualifier='middleName']" />
        <xsl:text>&#160;</xsl:text>
        <xsl:value-of select="./janes:doubleList[@qualifier='person']/janes:second//janes:label[@qualifier='surname']" />
        <xsl:text>&#160;</xsl:text>
        <xsl:value-of select="./janes:doubleList[@qualifier='person']/janes:second//janes:label[@qualifier='suffix']" />
        <xsl:text>&#160;</xsl:text>
      </xsl:element>
      <xsl:for-each select="janes:para">
        <xsl:call-template name="KP.build.comms" />
      </xsl:for-each>
    </td>
  </xsl:template>

  <!-- ******************************************** -->

  <xsl:template name="KP_no_comms">
    <td>
      <xsl:value-of select="./janes:doubleList[@qualifier='person']//janes:label[@qualifier='jobTitle']" />
    </td>
    <td>
      <xsl:element name="strong">
        <xsl:value-of select="./janes:doubleList[@qualifier='person']/janes:second//janes:label[@qualifier='title']" />
        <xsl:text>&#160;</xsl:text>
        <xsl:value-of select="./janes:doubleList[@qualifier='person']/janes:second//janes:label[@qualifier='firstName']" />
        <xsl:text>&#160;</xsl:text>
        <xsl:value-of select="./janes:doubleList[@qualifier='person']/janes:second//janes:label[@qualifier='middleName']" />
        <xsl:text>&#160;</xsl:text>
        <xsl:value-of select="./janes:doubleList[@qualifier='person']/janes:second//janes:label[@qualifier='surname']" />
        <xsl:text>&#160;</xsl:text>
        <xsl:value-of select="./janes:doubleList[@qualifier='person']/janes:second//janes:label[@qualifier='suffix']" />
        <xsl:text>&#160;</xsl:text>
      </xsl:element>
    </td>
  </xsl:template>
  <!-- ******************************************** -->

  <xsl:template name="KP.build.comms">
    <xsl:if test="@qualifier='Telephone'">
      <br />
      <xsl:text>Tel: </xsl:text>
      <xsl:call-template name="createPerTelephone" />
      <xsl:value-of select="$n" />
    </xsl:if>
    <xsl:if test="@qualifier='Mobile'">
      <br />
      <xsl:text>Mobile: </xsl:text>
      <xsl:call-template name="createPerTelephone" />
      <xsl:value-of select="$n" />
    </xsl:if>
    <xsl:if test="@qualifier='Cable'">
      <br />
      <xsl:text>Cable: </xsl:text>
      <xsl:call-template name="createPerTelephone" />
      <xsl:value-of select="$n" />
    </xsl:if>
    <xsl:if test="@qualifier='Telex'">
      <br />
      <xsl:text>Telex: </xsl:text>
      <xsl:call-template name="createPerTelephone" />
      <xsl:value-of select="$n" />
    </xsl:if>
    <xsl:if test="@qualifier='Fax'">
      <br />
      <xsl:text>Fax: </xsl:text>
      <xsl:call-template name="createPerTelephone" />
      <xsl:value-of select="$n" />
    </xsl:if>
    <xsl:if test="@qualifier='e-mail'">
      <br />
      <xsl:text>E-mail: </xsl:text>
      <a>
        <xsl:attribute name="href">
          <xsl:text>mailto:</xsl:text>
          <xsl:call-template name="createPerOrgCode" />
        </xsl:attribute>
        <xsl:call-template name="createPerOrgCode" />
        <xsl:value-of select="$n" />
      </a>
    </xsl:if>
    <xsl:if test="@qualifier='Web'">
      <br />
      <xsl:text>Web: </xsl:text>
      <xsl:call-template name="createKPWebCode" />
      <xsl:value-of select="$n" />
    </xsl:if>
    <xsl:if test="@qualifier='FTP'">
      <br />
      <xsl:text>FTP: </xsl:text>
      <xsl:call-template name="createPerOrgCode" />
      <xsl:value-of select="$n" />
    </xsl:if>
    <xsl:if test="@qualifier='CompuServe'">
      <br />
      <xsl:text>CompuServe: </xsl:text>
      <xsl:call-template name="createPerOrgCode" />
      <xsl:value-of select="$n" />
    </xsl:if>
    <xsl:if test="position() = last()">
      <br />
    </xsl:if>
  </xsl:template>

  <!-- ******************************************** -->

  <xsl:template name="createPerTelephone">

    <xsl:text>(+</xsl:text>
    <xsl:value-of select="./janes:label[@qualifier='intlCode']" />
    <xsl:text>&#160;</xsl:text>
    <xsl:value-of select="./janes:label[@qualifier='areaCode']" />
    <xsl:text>) </xsl:text>
    <xsl:value-of select="./janes:label[@qualifier='value']" />
    <xsl:value-of select="$n" />
    <xsl:choose>
      <xsl:when test=".//janes:label[@qualifier='qualification'] !=''">
        <xsl:text>(</xsl:text>
        <xsl:value-of select="./janes:label[@qualifier='qualification']" />
        <xsl:text>)</xsl:text>
        <xsl:value-of select="$n" />
      </xsl:when>
      <xsl:otherwise />
    </xsl:choose>
  </xsl:template>
  <!-- ******************************************** -->
  <xsl:template name="createPerOrgCode">

    <xsl:value-of select="./janes:label[@qualifier='value']" />
    <xsl:value-of select="$n" />
    <xsl:choose>
      <xsl:when test=".//janes:label[@qualifier='qualification'] !=''">
        <xsl:text>(</xsl:text>
        <xsl:value-of select="./janes:label[@qualifier='qualification']" />
        <xsl:text>)</xsl:text>
        <xsl:value-of select="$n" />
      </xsl:when>
      <xsl:otherwise>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  <!-- ************************************************************************************************************************************************************************************** -->

  <xsl:template match="janes:dataGroup[@qualifier='AE - Aircraft Fleet']">
    <h2>Fixed-Wing Fleet</h2>
    <xsl:for-each select="./janes:para">
      <xsl:value-of select="." />
      <br />
    </xsl:for-each>
  </xsl:template>

  <!-- ************************************************************************************************************************************************************************************** -->

  <xsl:template match="janes:dataGroup[@qualifier='HE - Helicopter Fleet']">
    <xsl:if test="preceding-sibling::janes:dataGroup[1][@qualifier!='AE - Aircraft Fleet']">
      <xsl:value-of select="$n" />
    </xsl:if>
    <h2>Rotary-Wing Fleet</h2>
    <xsl:for-each select="./janes:para">
      <xsl:value-of select="." />
      <br />
    </xsl:for-each>
  </xsl:template>

  <!-- ************************************************************************************************************************************************************************************** -->

  <xsl:template match="janes:dataGroup[@qualifier='Description']">
    <h2>Activities/Services</h2>
    <xsl:for-each select="./janes:para">
      <xsl:value-of select="." />
      <br />
    </xsl:for-each>
    <xsl:value-of select="$n" />
  </xsl:template>

  <!-- * prodService ************************************************************************************************************************************************************************************* -->
  <xsl:template match="janes:dataGroup[@qualifier='prodService']">
    <h2>Products/Services</h2>
    <xsl:for-each select="./janes:para">
      <xsl:value-of select="./janes:label[@qualifier='name']" />
      <br />
    </xsl:for-each>
  </xsl:template>

  <!-- * Accreditations ************************************************************************************************************************************************************************************* -->
  <xsl:template match="janes:dataGroup[@qualifier='Accreditations']">
    <h2>Accreditations</h2>
    <xsl:value-of select="." />
    <br />
  </xsl:template>

  <!-- * Financial ************************************************************************************************************************************************************************************* -->
  <xsl:template match="janes:dataGroup[@qualifier='Financial']">
    <xsl:if test="preceding-sibling::janes:dataGroup[1][@qualifier!='Financial']">
      <h2>Financial</h2>
    </xsl:if>
    <xsl:if test="janes:title/text()!=''">
      <xsl:element name="em">
        <xsl:value-of select="janes:title" />
        <br />
      </xsl:element>
    </xsl:if>
    <xsl:for-each select="janes:para">
      <xsl:value-of select="." />
      <br />
    </xsl:for-each>
  </xsl:template>

  <!-- * Subsidiaries ***************************** -->
  <xsl:template match="janes:dataGroup[@qualifier='Subsidiaries']">
    <h2>
      <xsl:value-of select="janes:title" />
    </h2>
    <br />
    <xsl:for-each select="janes:para">
      <xsl:value-of select="." />
      <br />
    </xsl:for-each>
  </xsl:template>

  <!-- * Publications ***************************** -->
  <xsl:template match="janes:dataGroup[@qualifier='Publications']">
    <h2>Publications</h2>
    <xsl:variable name="countPubs" select="count(janes:para)" />
    <xsl:choose>
      <xsl:when test="$countPubs=1">
        <xsl:value-of select="." />
        <br />
      </xsl:when>
      <xsl:otherwise>
        <br />
        <xsl:for-each select="janes:para">
          <xsl:value-of select="." />
          <br />
        </xsl:for-each>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- * Representing ***************************** -->
  <xsl:template match="janes:dataGroup[@qualifier='Representing']">
    <h2>Representing</h2>
    <xsl:for-each select="janes:para">
      <xsl:value-of select="." />
      <br />
    </xsl:for-each>
  </xsl:template>

  <!-- * Company registration number ***************************** -->
  <xsl:template match="janes:para[@qualifier='Company Registration Number']">
    <h2>Company Registration Number</h2>
    <xsl:value-of select="." />
    <br />
    <xsl:value-of select="$n" />
  </xsl:template>

  <!-- * VAT registration number ***************************** -->
  <xsl:template match="janes:para[@qualifier='VAT Registration Number']">
    <h2>VAT Registration Number</h2>
    <xsl:value-of select="." />
    <br />
    <xsl:value-of select="$n" />
  </xsl:template>

  <!-- ******************************************************************************************* -->
  <xsl:template match="janes:dataGroup[@qualifier='orgRelation']">
    <br />
    <xsl:variable name="decide_org_Type" select="./janes:para[1]/@qualifier" />
    <xsl:variable name="count_paras" select="count(./janes:para)" />
    <xsl:choose>
      <xsl:when test="$decide_org_Type ='subsidiary'">
        <xsl:choose>
          <xsl:when test="$count_paras =1">
            <h2>Subsidiary/Affiliate</h2>
            <xsl:for-each select="./janes:para">
              <xsl:call-template name="organisationRel" />
            </xsl:for-each>
          </xsl:when>
          <xsl:otherwise>
            <h2>Subsidiaries/Affiliates</h2>
            <xsl:for-each select="./janes:para">
              <xsl:call-template name="organisationRel" />
            </xsl:for-each>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:when>
      <xsl:when test="$decide_org_Type ='subordinate'">
        <xsl:choose>
          <xsl:when test="$count_paras =1">
            <h2>Subordinate Unit</h2>
            <xsl:for-each select="./janes:para">
              <xsl:call-template name="organisationRel" />
            </xsl:for-each>
          </xsl:when>
          <xsl:otherwise>
            <h2>Subordinate Units</h2>
            <xsl:for-each select="./janes:para">
              <xsl:call-template name="organisationRel" />
            </xsl:for-each>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:when>
      <xsl:when test="$decide_org_Type ='parent-subsidiary'">
        <xsl:choose>
          <xsl:when test="$count_paras =1">
            <h2>Subsidiary/Affiliate of</h2>
            <xsl:for-each select="./janes:para">
              <xsl:call-template name="organisationRel" />
            </xsl:for-each>
          </xsl:when>
          <xsl:otherwise>
            <h2>Subordinate units of</h2>
            <xsl:for-each select="./janes:para">
              <xsl:call-template name="organisationRel" />
            </xsl:for-each>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:when>
      <xsl:when test="$decide_org_Type ='parent-subordinate'">
        <xsl:choose>
          <xsl:when test="$count_paras =1">
            <h2>Subordinate unit of</h2>
            <xsl:for-each select="./janes:para">
              <xsl:call-template name="organisationRel" />
            </xsl:for-each>
          </xsl:when>
          <xsl:otherwise>
            <h2>Subsidiaries/Affiliates of</h2>
            <xsl:for-each select="./janes:para">
              <xsl:call-template name="organisationRel" />
            </xsl:for-each>
          </xsl:otherwise>
        </xsl:choose>
        <!-- <xsl:for-each select="./janes:para">
								<xsl:call-template name="organisationRel" />
						</xsl:for-each> -->
      </xsl:when>
      <xsl:otherwise />
    </xsl:choose>
    <xsl:value-of select="$n" />
  </xsl:template>

  <!-- ****************************** -->
  <xsl:template name="organisationRel">
    <xsl:choose>
      <xsl:when test="janes:label[@qualifier='orgName']/janes:link">
        <xsl:variable name="org_Type" select="@qualifier" />
        <xsl:variable name="orgId" select="format-number(janes:label[@qualifier='orgName']/janes:link/@xlink:href, '00000000')" />
        <xsl:variable name="orgName" select="janes:label[@qualifier='orgName']/janes:link/janes:linkText" />
        <xsl:variable name="divName" select="janes:label[@qualifier='divName']" />
        <xsl:variable name="city" select="janes:label[@qualifier='city']" />
        <xsl:variable name="country" select="janes:label[@qualifier='country']" />
        <xsl:variable name="fromDate" select="janes:label[@qualifier='fromDate']" />
        <xsl:variable name="countorgRel" select="count(ancestor::janes:record//janes:dataGroup[@qualifier='orgRelation'])" />
        <a target="_blank">
          <xsl:attribute name="href">
            <xsl:value-of select="concat('/Janes/DisplayFile/', $orgId, '?pubabbrev=', $pubabbrev)" />
          </xsl:attribute>
          <xsl:if test="$orgName !=''">
            <xsl:value-of select="$orgName" />
          </xsl:if>
          <xsl:if test="$divName !=''">
            <xsl:text>, </xsl:text>
            <xsl:value-of select="$divName" />
          </xsl:if>
          <xsl:if test="$country !=''">
            <xsl:text>, </xsl:text>
            <xsl:value-of select="$country" />
          </xsl:if>
        </a>
        <br />
        <xsl:value-of select="$n" />
      </xsl:when>
      <xsl:otherwise>
        <xsl:variable name="org_Type" select="@qualifier" />
        <xsl:variable name="orgId" select="format-number(janes:label[@qualifier='orgId'], '00000000')" />
        <xsl:variable name="orgName" select="janes:label[@qualifier='orgName']" />
        <xsl:variable name="divName" select="janes:label[@qualifier='divName']" />
        <xsl:variable name="city" select="janes:label[@qualifier='city']" />
        <xsl:variable name="country" select="janes:label[@qualifier='country']" />
        <xsl:variable name="fromDate" select="janes:label[@qualifier='fromDate']" />
        <xsl:variable name="countorgRel" select="count(ancestor::janes:record//janes:dataGroup[@qualifier='orgRelation'])" />
        <xsl:if test="$orgName !=''">
          <xsl:value-of select="$orgName" />
        </xsl:if>
        <xsl:if test="$divName !=''">
          <xsl:text>, </xsl:text>
          <xsl:value-of select="$divName" />
        </xsl:if>
        <xsl:if test="$country !=''">
          <xsl:text>, </xsl:text>
          <xsl:value-of select="$country" />
        </xsl:if>
        <br />
        <xsl:value-of select="$n" />
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- **  Pri_Sec_business_type **************************** -->

  <xsl:template name="Pri_Sec_business_type">
    <h2>Primary Business Type</h2>
    <xsl:value-of select=".//janes:metadata/jm:organisation/jm:classification[@qualifier='primary']/jm:standardName" />
    <xsl:variable name="number_secondary" select="count(.//janes:metadata/jm:organisation/jm:classification[@qualifier='secondary'])" />
    <xsl:choose>
      <xsl:when test="$number_secondary = 1">
        <h2>Secondary Business Type</h2>
        <xsl:value-of select=".//janes:metadata/jm:organisation/jm:classification[@qualifier='secondary']/jm:standardName" />
      </xsl:when>
      <xsl:when test="$number_secondary > 1">
        <h2>Secondary Business Types</h2>
        <xsl:for-each select=".//janes:metadata/jm:organisation/jm:classification[@qualifier='secondary']">
          <br />
          <xsl:text>&#160;&#160;&#160;</xsl:text>
          <xsl:value-of select="./jm:standardName" />
          <xsl:value-of select="$n" />
        </xsl:for-each>
      </xsl:when>
      <xsl:otherwise>
      </xsl:otherwise>
    </xsl:choose>
    <br />
  </xsl:template>

  <xsl:template match="janes:thead/janes:row/janes:entry">
    <xsl:call-template name="process.cell">
      <xsl:with-param name="cellgi">th</xsl:with-param>
      <xsl:with-param name="scope">col</xsl:with-param>
    </xsl:call-template>
  </xsl:template>

  <xsl:template match="janes:tbody/janes:row/janes:entry">
    <xsl:call-template name="process.cell">
      <xsl:with-param name="cellgi">td</xsl:with-param>
    </xsl:call-template>
  </xsl:template>

  <xsl:template match="janes:tfoot/janes:row/janes:entry">
    <xsl:call-template name="process.cell">
      <xsl:with-param name="cellgi">th</xsl:with-param>
    </xsl:call-template>
  </xsl:template>

  <xsl:template name="process.cell">
    <xsl:param name="cellgi">td</xsl:param>
    <xsl:param name="scope"></xsl:param>
    <xsl:variable name="empty.cell" select="count(node()) = 0" />

    <xsl:variable name="entry.colnum">
      <xsl:call-template name="entry.colnum" />
    </xsl:variable>

    <xsl:if test="$entry.colnum != ''">
      <xsl:call-template name="add-empty-entries">
        <xsl:with-param name="number"
								 select="$entry.colnum - count(preceding-sibling::*) - 1" />
      </xsl:call-template>
    </xsl:if>

    <xsl:element name="{$cellgi}">
      <xsl:if test="@morerows">
        <xsl:attribute name="rowspan">
          <xsl:value-of select="@morerows+1" />
        </xsl:attribute>
      </xsl:if>
      <xsl:if test="@namest">
        <xsl:attribute name="colspan">
          <xsl:call-template name="calculate.colspan" />
        </xsl:attribute>
      </xsl:if>
      <xsl:attribute name="align">
        <xsl:text>left</xsl:text>
      </xsl:attribute>

      <xsl:if test="@charoff">
        <xsl:attribute name="charoff">
          <xsl:value-of select="@charoff" />
        </xsl:attribute>
      </xsl:if>
      <xsl:if test="@valign">
        <xsl:attribute name="valign">
          <xsl:value-of select="@valign" />
        </xsl:attribute>
      </xsl:if>
      <xsl:if test="$scope != ''">
        <xsl:if test=". != ''">
          <xsl:attribute name="scope">
            <xsl:value-of select="$scope" />
          </xsl:attribute>
        </xsl:if>
      </xsl:if>

      <xsl:choose>
        <xsl:when test="$empty.cell">
          <xsl:text>&#160;</xsl:text>
        </xsl:when>
        <xsl:otherwise>
          <xsl:apply-templates />
        </xsl:otherwise>
      </xsl:choose>
    </xsl:element>
  </xsl:template>

  <xsl:template name="entry.colnum">
    <xsl:param name="entry" select="." />
    <xsl:choose>
      <xsl:when test="$entry/@colname">
        <xsl:variable name="colname" select="$entry/@colname" />
        <xsl:variable name="colspec"
																		select="$entry/ancestor::tgroup/colspec[@colname=$colname]" />
        <xsl:call-template name="colspec.colnum">
          <xsl:with-param name="colspecs" select="$colspec" />
        </xsl:call-template>
      </xsl:when>
      <xsl:when test="$entry/@namest">
        <xsl:variable name="namest" select="$entry/@namest" />
        <xsl:variable name="colspec"
																		select="$entry/ancestor::tgroup/colspec[@colname=$namest]" />
        <xsl:call-template name="colspec.colnum">
          <xsl:with-param name="colspecs" select="$colspec" />
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise></xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="add-empty-entries">
    <xsl:param name="number" select="'0'" />
    <xsl:choose>
      <xsl:when test="$number &lt;= 0"></xsl:when>
      <xsl:otherwise>
        <td>&#160;</td>
        <xsl:value-of select="$n" />
        <xsl:call-template name="add-empty-entries">
          <xsl:with-param name="number" select="$number - 1" />
        </xsl:call-template>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="colspec.colnum">
    <xsl:param name="colname"></xsl:param>
    <xsl:param name="colspecs" select="../../../../janes:tgroup/janes:colspec" />
    <xsl:param name="count">1</xsl:param>
    <xsl:param name="colnum">1</xsl:param>
    <xsl:choose>
      <xsl:when test="$count>count($colspecs)"></xsl:when>
      <xsl:otherwise>
        <xsl:variable name="colspec" select="$colspecs[$count=position()]" />
        <xsl:choose>
          <xsl:when test="$colspec/@colname=$colname">
            <xsl:choose>
              <xsl:when test="$colspec/@colnum">
                <xsl:value-of select="$colspec/@colnum" />
              </xsl:when>
              <xsl:otherwise>
                <xsl:value-of select="$colnum" />
              </xsl:otherwise>
            </xsl:choose>
          </xsl:when>
          <xsl:otherwise>
            <xsl:call-template name="colspec.colnum">
              <xsl:with-param name="colname" select="$colname" />
              <xsl:with-param name="colspecs" select="$colspecs" />
              <xsl:with-param name="count" select="$count+1" />
              <xsl:with-param name="colnum">
                <xsl:choose>
                  <xsl:when test="$colspec/@colnum">
                    <xsl:value-of select="$colspec/@colnum + 1" />
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:value-of select="$colnum + 1" />
                  </xsl:otherwise>
                </xsl:choose>
              </xsl:with-param>
            </xsl:call-template>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="calculate.colspan">
    <xsl:variable name="scol">
      <xsl:call-template name="colspec.colnum">
        <xsl:with-param name="colname" select="@namest" />
      </xsl:call-template>
    </xsl:variable>
    <xsl:variable name="ecol">
      <xsl:call-template name="colspec.colnum">
        <xsl:with-param name="colname" select="@nameend" />
      </xsl:call-template>
    </xsl:variable>
    <xsl:value-of select="$ecol - $scol + 1" />
    <!--<xsl:text>"$ecol - $scol + 1"</xsl:text>-->
  </xsl:template>

  <xsl:template name="genJFSShipCount">
    <xsl:param name="countType" />
    <xsl:param name="countTypeMeta" />
    <xsl:param name="countTypeEnhanced" />
    <xsl:param name="id" />

    <xsl:variable name="elementlocalname" select="concat($countTypeMeta, 'No')" />

    <xsl:choose>
      <xsl:when test="$id != ''">

        <xsl:if test="//janes:shipTotal[janes:className/@xref = $id]/*[local-name() = $elementlocalname][text() != &#34;&#34;]">
          <b>
            <xsl:text>&#160;&#160;</xsl:text>
            <xsl:value-of select="$countType" />
            <xsl:text>: </xsl:text>
            <xsl:value-of select="//janes:shipTotal[janes:className/@xref = $id]/*[local-name() = $elementlocalname]" />
          </b>
          <br />
        </xsl:if>
      </xsl:when>

      <xsl:when test="//janes:shipTotal/*[local-name() = $elementlocalname][text() != &#34;&#34;]">

        <b>
          <xsl:value-of select="$countType" />
          <xsl:text>: </xsl:text>
          <xsl:value-of select="//janes:shipTotal/*[local-name() = $elementlocalname][text() != &#34;&#34;][1]" />
        </b>
        <br />
      </xsl:when>

      <xsl:when test="/janes:record/janes:metadata/dc:subject[@qualifier = $countTypeMeta][1] and janes:record/janes:metadata/dc:subject[@qualifier = $countTypeMeta][1] != &#34;&#34;">
        <b>
          <xsl:value-of select="$countType" />
          <xsl:text>: </xsl:text>
          <xsl:value-of select="/janes:record/janes:metadata/dc:subject[@qualifier = $countTypeMeta][1]" />
        </b>
        <br />
      </xsl:when>

      <xsl:when test="//jm:inventory/*[local-name() = $countTypeEnhanced][. != &#34;&#34;]">
        <b>
          <xsl:value-of select="$countType" />
          <xsl:text>: </xsl:text>
          <xsl:value-of select="//jm:inventory/*[local-name() = $countTypeEnhanced][. != &#34;&#34;][1]" />
        </b>
        <br />
      </xsl:when>

      <xsl:otherwise />
    </xsl:choose>
  </xsl:template>

  <!-- Thursday 14th November - 15:00 (UK) / 10:00 (New York) Register for this Briefing -->
  <!-- 																<span class="register">
																<p>Thursday 14th November - 15:00 (UK) / 10:00 (New York)</p>
																	<a class="ihsStandardButton" href="#">Register for this Briefing</a>
																</span> -->
  <!-- 2013/11/26 15:00|923734473 -->

  <xsl:template name="createSeminarFromString">
    <xsl:param name="string" />

    <xsl:if test="not(normalize-space(substring-after($string, '|')) = '')  or substring-after($string, '|') = '123456789'">
      <button class="btn btn-primary btnRegister" type="button">
        <xsl:attribute name="data-id">
          <xsl:value-of select="substring-after($string, '|')" />
        </xsl:attribute>
        <xsl:attribute name="data-title">
          <xsl:call-template name="urlise">
            <xsl:with-param name="string">
              <xsl:value-of select="$title" />
            </xsl:with-param>
          </xsl:call-template>
        </xsl:attribute>
        <xsl:attribute name="data-date">
          <xsl:call-template name="urlDate">
            <xsl:with-param name="string">
              <xsl:value-of select="substring-before($string, ' ')" />
            </xsl:with-param>
          </xsl:call-template>
        </xsl:attribute>
        <xsl:attribute name="data-time">
          <xsl:call-template name="TwentyFourHourto12Hour">
            <xsl:with-param name="hours">
              <xsl:value-of select="substring-before(substring-before(substring-after($string, ' '), '|'), ':')" />
            </xsl:with-param>
            <xsl:with-param name="minutes">
              <xsl:value-of select="substring-after(substring-before(substring-after($string, ' '), '|'), ':')" />
            </xsl:with-param>
          </xsl:call-template>
        </xsl:attribute>
        <xsl:text>Register for this Briefing on - </xsl:text>
        <xsl:call-template name="addOrdinaltoDateNumber">
          <xsl:with-param name="dayNum">
            <xsl:value-of select="substring-before(substring-after(substring-after($string, '/'), '/'), ' ')" />
          </xsl:with-param>
        </xsl:call-template>
        <xsl:text> </xsl:text>
        <xsl:call-template name="numbertoFullMonthName">
          <xsl:with-param name="monthNum">
            <xsl:value-of select="substring-before(substring-after($string, '/'), '/')" />
          </xsl:with-param>
        </xsl:call-template>
        <xsl:text> - </xsl:text>
        <xsl:value-of select="substring-before(substring-after($string, ' '), '|')" />
        <xsl:text> (UK) </xsl:text>
      </button>
      <br/>
    </xsl:if>
  </xsl:template>

  <xsl:template name="videoPlayer">
    <xsl:param name="string" />
    <div class="jwVidPlayer">
      <div id="vidPlayer">
        <xsl:value-of select="concat($nimagebs, $string)" />
      </div>
    </div>
    <!-- NOTE disableConsolidation=true is required for swf file download to work properly DO NOT REMOVE (see Bug 122012) -->
    <script type="text/javascript" src="/JavaScript/jwplayer/jwplayer.js?disableConsolidation=true"></script>
    <script type='text/javascript'>
      jwplayer('vidPlayer').setup({
      file: '<xsl:value-of select="concat($nimagebs, $string)" />',
      title: 'Play',
      image: '/App_Themes/Default/images/ihs_logo474.png',
      width: '640',
      height: '360',
      aspectratio: '16:9',
      fallback: 'true',
      primary: 'html5',
      startparam: "starttime"
      });
    </script>
  </xsl:template>

  <xsl:template name="urlDate">

    <xsl:param name="string" />

    <xsl:if test="not(normalize-space($string) = '')">
      <xsl:value-of select="substring-after(substring-after($string, '/'), '/')" />
      <xsl:text> </xsl:text>
      <xsl:call-template name="numbertoThreeLetterName">
        <xsl:with-param name="monthNum">
          <xsl:value-of select="substring-before(substring-after($string, '/'), '/')" />
        </xsl:with-param>
      </xsl:call-template>
      <xsl:text> </xsl:text>
      <xsl:value-of select="substring-before($string, '/')" />
    </xsl:if>
  </xsl:template>

  <xsl:template name="TwentyFourHourto12Hour">

    <xsl:param name="hours" />
    <xsl:param name="minutes" />

    <xsl:if test="not($hours = '')">
      <xsl:choose>
        <xsl:when test="not(number($hours)) or  number($hours) = 0" />
        <xsl:when test="number($hours) &gt; 12">
          <xsl:value-of select="string(number($hours) - 12)" />
          <xsl:text>:</xsl:text>
          <xsl:value-of select="$minutes" />
          <xsl:text> PM</xsl:text>
        </xsl:when>
        <xsl:when test="number($hours) &lt; 12">
          <xsl:value-of select="string(number($hours))" />
          <xsl:text>:</xsl:text>
          <xsl:value-of select="$minutes" />
          <xsl:text> AM</xsl:text>
        </xsl:when>
      </xsl:choose>
    </xsl:if>
  </xsl:template>

  <xsl:template name="urlise">
    <xsl:param name="string" />
    <xsl:call-template name="replace-string">
      <xsl:with-param name="text" select="$string" />
      <xsl:with-param name="replace" select="'&amp;'" />
      <xsl:with-param name="with" select="'%26'" />
    </xsl:call-template>
  </xsl:template>

  <xsl:template name="replace-string">
    <xsl:param name="text" />
    <xsl:param name="replace" />
    <xsl:param name="with" />
    <xsl:choose>
      <xsl:when test="contains($text,$replace)">
        <xsl:value-of select="substring-before($text,$replace)" />
        <xsl:value-of select="$with" />
        <xsl:call-template name="replace-string">
          <xsl:with-param name="text" select="substring-after($text,$replace)" />
          <xsl:with-param name="replace" select="$replace" />
          <xsl:with-param name="with" select="$with" />
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$text" />
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="addOrdinaltoDateNumber">
    <xsl:param name="dayNum">
      <xsl:text>0</xsl:text>
    </xsl:param>
    <xsl:choose>
      <xsl:when test="$dayNum = '' or $dayNum = '0'" />
      <xsl:when test="$dayNum = '01' or $dayNum = '1'">1st</xsl:when>
      <xsl:when test="$dayNum = '02' or $dayNum = '2'">2nd</xsl:when>
      <xsl:when test="$dayNum = '03' or $dayNum = '3'">3rd</xsl:when>
      <xsl:when test="$dayNum = '21'">21st</xsl:when>
      <xsl:when test="$dayNum = '22'">22nd</xsl:when>
      <xsl:when test="$dayNum = '23'">23rd</xsl:when>
      <xsl:when test="$dayNum = '31'">31st</xsl:when>
      <xsl:when test="starts-with($dayNum, '0')">
        <xsl:value-of select="substring-after($dayNum, '0')" />
        <xsl:text>th</xsl:text>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$dayNum" />
        <xsl:text>th</xsl:text>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="numbertoFullMonthName">
    <xsl:param name="monthNum" />
    <xsl:choose>
      <xsl:when test="$monthNum = '1' or $monthNum = '01'">
        <xsl:text>January</xsl:text>
      </xsl:when>
      <xsl:when test="$monthNum = '2' or $monthNum = '02'">
        <xsl:text>February</xsl:text>
      </xsl:when>
      <xsl:when test="$monthNum = '3' or $monthNum = '03'">
        <xsl:text>March</xsl:text>
      </xsl:when>
      <xsl:when test="$monthNum = '4' or $monthNum = '04'">
        <xsl:text>April</xsl:text>
      </xsl:when>
      <xsl:when test="$monthNum = '5' or $monthNum = '05'">
        <xsl:text>May</xsl:text>
      </xsl:when>
      <xsl:when test="$monthNum = '6' or $monthNum = '06'">
        <xsl:text>June</xsl:text>
      </xsl:when>
      <xsl:when test="$monthNum = '7' or $monthNum = '07'">
        <xsl:text>July</xsl:text>
      </xsl:when>
      <xsl:when test="$monthNum = '8' or $monthNum = '08'">
        <xsl:text>August</xsl:text>
      </xsl:when>
      <xsl:when test="$monthNum = '9' or $monthNum = '09'">
        <xsl:text>September</xsl:text>
      </xsl:when>
      <xsl:when test="$monthNum = '10'">
        <xsl:text>October</xsl:text>
      </xsl:when>
      <xsl:when test="$monthNum = '11'">
        <xsl:text>November</xsl:text>
      </xsl:when>
      <xsl:when test="$monthNum = '12'">
        <xsl:text>December</xsl:text>
      </xsl:when>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="numbertoThreeLetterName">
    <xsl:param name="monthNum" />
    <xsl:choose>
      <xsl:when test="$monthNum = '1' or $monthNum = '01'">
        <xsl:text>Jan</xsl:text>
      </xsl:when>
      <xsl:when test="$monthNum = '2' or $monthNum = '02'">
        <xsl:text>Feb</xsl:text>
      </xsl:when>
      <xsl:when test="$monthNum = '3' or $monthNum = '03'">
        <xsl:text>Mar</xsl:text>
      </xsl:when>
      <xsl:when test="$monthNum = '4' or $monthNum = '04'">
        <xsl:text>Apr</xsl:text>
      </xsl:when>
      <xsl:when test="$monthNum = '5' or $monthNum = '05'">
        <xsl:text>May</xsl:text>
      </xsl:when>
      <xsl:when test="$monthNum = '6' or $monthNum = '06'">
        <xsl:text>Jun</xsl:text>
      </xsl:when>
      <xsl:when test="$monthNum = '7' or $monthNum = '07'">
        <xsl:text>Jul</xsl:text>
      </xsl:when>
      <xsl:when test="$monthNum = '8' or $monthNum = '08'">
        <xsl:text>Aug</xsl:text>
      </xsl:when>
      <xsl:when test="$monthNum = '9' or $monthNum = '09'">
        <xsl:text>Sep</xsl:text>
      </xsl:when>
      <xsl:when test="$monthNum = '10'">
        <xsl:text>Oct</xsl:text>
      </xsl:when>
      <xsl:when test="$monthNum = '11'">
        <xsl:text>Nov</xsl:text>
      </xsl:when>
      <xsl:when test="$monthNum = '12'">
        <xsl:text>Dec</xsl:text>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$monthNum"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
</xsl:stylesheet>