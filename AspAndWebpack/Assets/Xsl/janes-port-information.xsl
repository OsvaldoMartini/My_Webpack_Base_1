<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output encoding="UTF-8" indent="yes" method="html" omit-xml-declaration="yes" />

  <xsl:variable name="section" select="section"/>
  <xsl:variable name="title" select="$section/title" />
  <xsl:param name="stringLookups">
    <!-- PUT IN ALPHABETICAL ORDER PLEASE -->
    <string language="en" key="Annual_No_Vessels">Annual Number of Vessels</string>
    <string language="en" key="Annual_TEU">Annual TEU</string>
    <string language="en" key="Annual_Tonnage">Annual Tonnage</string>
    <string language="en" key="breakBulk">Break Bulk</string>
    <string language="en" key="container">Container</string>
    <string language="en" key="country">Country</string>
    <string language="en" key="countryiso">Country ISO</string>
    <string language="en" key="CSI_Compliant">CSI Compliant</string>
    <string language="en" key="dry_bulk">Dry Bulk</string>
    <string language="en" key="dry_dock">Dry Dock</string>
    <string language="en" key="facilitytype">Facility Type</string>
    <string language="en" key="gas">Gas</string>
    <string language="en" key="ISPS_Compliant">ISPS Compliant</string>
    <string language="en" key="liquid">Liquid</string>
    <string language="en" key="associatedEquipments">Associated Equipment</string>
    <string language="en" key="Maximum_Draft">Maximum Draft</string>
    <string language="en" key="Max_Beam">Maximum Beam</string>
    <string language="en" key="Max_DWT">Maximum DWT</string>
    <string language="en" key="Max_LOA">Maximum LOA</string>
    <string language="en" key="mlWorldPortNumber">Master Port Number</string>
    <string language="en" key="mlUNLCODE">UN/LOCODE</string>
    <string language="en" key="multi_purpose">Multi Purpose</string>
    <string language="en" key="numberofrunways">Number of Runways</string>
    <string language="en" key="operators">Operators</string>
    <string language="en" key="passenger">Passenger</string>
    <string language="en" key="publishednotes">Published Notes</string>
    <string language="en" key="region">Region</string>
    <string language="en" key="roro">Roll On/Roll Off</string>
    <string language="en" key="subtype">Sub Type</string>
    <string language="en" key="title">Title</string>
    <string language="en" key="type">Type</string>
    <string language="en" key="UNCTAD_Code">UNCTAD Code</string>
    <!-- PUT IN ALPHABETICAL ORDER PLEASE -->
  </xsl:param>

  <xsl:template match="/">

    <!-- Container -->
    <div class="grid-container" style="margin-left:10px;">
      <div class="grid" style="margin-top:5px;">
        <div class="grid-1">
          <!-- Main Content -->
          <div class="panel panel-default">
            <div class="panel-heading">
              <xsl:value-of select="concat($title, ' ' )"/>
            </div>
            <div class="panel-body">
              <div id="main-content">
                <xsl:apply-templates/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xsl:template>

  <xsl:template match="section">
    <div>
      <xsl:apply-templates/>
    </div>
  </xsl:template>

  <xsl:template match="//title[ancestor::section]">
  </xsl:template>

  <xsl:template match="//title[ancestor::subsection]">
    <a class="h4">
      <xsl:attribute name="href">
        <xsl:value-of select="concat('#', .)" />
      </xsl:attribute>
      <xsl:attribute name="name">
        <xsl:value-of select="."/>
      </xsl:attribute>
      <xsl:value-of select="."/>
    </a>
  </xsl:template>

  <xsl:template match="subsection" >
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="paragraph">
    <div class="margin-top:5px;">
      <xsl:apply-templates select="text()|*"/>
    </div>
  </xsl:template>

  <xsl:template match="text()">
    <p class="para">
      <xsl:value-of select="." disable-output-escaping="yes"/>
    </p>
  </xsl:template>

  <xsl:template match="Table">
    <div class="table-responsive">
      <table class="table table-bordered  table-hover table-condensed">
        <xsl:apply-templates/>
      </table>
    </div>
  </xsl:template>

  <xsl:template match="tr">
    <tr>
      <xsl:apply-templates/>
    </tr>
  </xsl:template>

  <xsl:template match="td">
    <td>
      <xsl:attribute name="colspan">
        berth
        <xsl:value-of select="./@colspan"/>
      </xsl:attribute>
      <xsl:value-of select="."/>
    </td>
  </xsl:template>

  <xsl:template match="facilities|details|metadata">

  </xsl:template>

  <xsl:template name="label">
    <xsl:param name="text" />
    <xsl:element name="div">
      <xsl:attribute name="class">u-padding-Bxxs</xsl:attribute>
      <xsl:choose>
        <xsl:when test="$stringLookups/string[upper-case(@key)=upper-case($text) and @language='en']">
          <xsl:value-of select="$stringLookups/string[upper-case(@key)=upper-case($text) and @language='en']"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="$text"/>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:text>:&#160;</xsl:text>
    </xsl:element>
  </xsl:template>

</xsl:stylesheet>
