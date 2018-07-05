<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output encoding="UTF-8" indent="yes" method="html" omit-xml-declaration="yes" />

  <xsl:variable name="content" select="mlInformation"/>
  <xsl:variable name="berths" select="$content/berths"/>
  <xsl:variable name="meta" select="$content/metadata"/>
  <xsl:variable name="section" select="$content/section"/>
  <xsl:variable name="details" select="$meta/details"/>
  <xsl:variable name="facilities" select="$meta/facilities"/>
  <xsl:variable name="metaSubject" select="$meta/subject"/>
  <xsl:variable name="date" select="$meta/postdate"/>
  <xsl:variable name="year" select="substring($date, 1, 4)" />
  <xsl:variable name="day" select="substring($date, 7, 2)" />

  <xsl:variable name="title" select="$meta/title" />
  <xsl:variable name="status" select="$meta/details/Status"/>
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
    <div class="grid-container" style="margin-top:5px;">
      <div class="grid">
        <div class="grid-1-1">
          <div class="panel panel-default">
            <div class="panel-heading">
              <xsl:value-of select="'Port Details '"/>
              <xsl:element name="a">
                <xsl:attribute name="href">
                  <xsl:value-of select="concat('/MaritimePorts/Display/Port_', $details/Port_ID)"/>
                </xsl:attribute>
                <xsl:attribute name="target">_blank</xsl:attribute>
                View Document
                <i class="icon-link-ext large"></i>
              </xsl:element>
            </div>
            <div class="panel-body">
              <xsl:call-template name="recordDetails">
                <xsl:with-param name="details" select="$details"/>
              </xsl:call-template>
            </div>
          </div>
        </div>

      </div>
      <div class="grid" style="margin-top:1px !important;">
        <div class="grid-1-1">
          <!-- Facilities -->
          <div class="panel panel-default">
            <div class="panel-heading">Port Facilities</div>
            <div class="panel-body" style="padding:16px!important;">
              <xsl:apply-templates select="$facilities" mode="header"/>
            </div>
          </div>

        </div>
      </div>
    </div>
  </xsl:template>


  <xsl:template name="facility">
    <xsl:param name="facility"/>
    <xsl:param name="name"/>
    <p class="u-bold u-padding-Txxs u-margin-Bxxs">
      <xsl:value-of select="$name"/>
    </p>
    <p>
      <xsl:choose>
        <xsl:when test="$facility = 'true'">
          Yes
        </xsl:when>
        <xsl:otherwise>
          No
        </xsl:otherwise>
      </xsl:choose>
    </p>

  </xsl:template>

  <xsl:template match="facilities" mode="header">
    <xsl:param name="facilities"/>

    <div class="grid" style="margin-top:5px !important;">
      <div class="grid-1-3">
        <xsl:call-template name="facility">
          <xsl:with-param name="facility" select="breakBulk"/>
          <xsl:with-param name="name" select="'Break Bulk'"/>
        </xsl:call-template>
        <xsl:call-template name="facility">
          <xsl:with-param name="facility" select="container"/>
          <xsl:with-param name="name" select="'Container'"/>
        </xsl:call-template>
        <xsl:call-template name="facility">
          <xsl:with-param name="facility" select="dry_bulk"/>
          <xsl:with-param name="name" select="'Dry Bulk'"/>
        </xsl:call-template>
      </div>
      <div class="grid-1-3">
        <xsl:call-template name="facility">
          <xsl:with-param name="facility" select="liquid"/>
          <xsl:with-param name="name" select="'Liquid'"/>
        </xsl:call-template>
        <xsl:call-template name="facility">
          <xsl:with-param name="facility" select="gas"/>
          <xsl:with-param name="name" select="'Gas'"/>
        </xsl:call-template>
        <xsl:call-template name="facility">
          <xsl:with-param name="facility" select="roro"/>
          <xsl:with-param name="name" select="'Roll On/Roll Off'"/>
        </xsl:call-template>
      </div>
      <div class="grid-1-3">
        <xsl:call-template name="facility">
          <xsl:with-param name="facility" select="passenger"/>
          <xsl:with-param name="name" select="'Passenger'"/>
        </xsl:call-template>
        <xsl:call-template name="facility">
          <xsl:with-param name="facility" select="multi_purpose"/>
          <xsl:with-param name="name" select="'Multi-Purpose'"/>
        </xsl:call-template>
        <xsl:call-template name="facility">
          <xsl:with-param name="facility" select="dry_dock"/>
          <xsl:with-param name="name" select="'Dry Dock'"/>
        </xsl:call-template>
      </div>
    </div>
  </xsl:template>

  <xsl:template name="recordDetails">
    <xsl:param name="details"/>

    <div class="grid" style="margin-top:5px;">
      <div class="grid-1-3">
        <p class="u-bold u-padding-Txxs u-margin-Bxxs">Status</p>
        <p>
          <xsl:value-of select="$details/Status"/>
        </p>

        <p class="u-bold u-padding-Txxs u-margin-Bxxs">Compliance</p>
        <xsl:if test="$details/ISPS_Compliant = 'true'">
          <p>ISPS</p>
        </xsl:if>
        <xsl:if test="$details/CSI_Compliant = 'true'">
          <p>CSI</p>
        </xsl:if>
        <xsl:if test="$details/CSI_Compliant = 'false' and $details/ISPS_Compliant = 'false'">
          <p>None</p>
        </xsl:if>
        <p class="u-bold u-padding-Txxs u-margin-Bxxs">Max DWT</p>
        <p>
          <xsl:apply-templates select="$details/Max_DWT"/>
        </p>
        <p class="u-bold u-padding-Txxs u-margin-Bxxs">UNL Code</p>
        <p>
          <xsl:choose>
            <xsl:when test="$details/UNCTAD_Code">
              <xsl:value-of select="$details/UNCTAD_Code"/>
            </xsl:when>
            <xsl:otherwise>
              Unknown
            </xsl:otherwise>
          </xsl:choose>
        </p>
      </div>
      <div class="grid-1-3">

        <p class="u-bold u-padding-Txxs u-margin-Bxxs">Max Draft</p>
        <p>
          <xsl:apply-templates select="$details/Maximum_Draft"/>
        </p>
        <p class="u-bold u-padding-Txxs u-margin-Bxxs">Annual Tonnage</p>
        <p>
          <xsl:apply-templates select="$details/Annual_Tonnage"/>
        </p>
        <p class="u-bold u-padding-Txxs u-margin-Bxxs">Annual Number of Pax</p>
        <p>
          <xsl:apply-templates select="$details/Annual_no_Pax"/>
        </p>
        <p class="u-bold u-padding-Txxs u-margin-Bxxs">Annual Number of Vessels</p>
        <p>
          <xsl:apply-templates select="$details/Annual_No_Vessels"/>
        </p>
      </div>
      <div class="grid-1-3">
        <p class="u-bold u-padding-Txxs u-margin-Bxxs">Annual TEU</p>
        <p>
          <xsl:apply-templates select="$details/Annual_TEU"/>
        </p>

        <p class="u-bold u-padding-Txxs u-margin-Bxxs">Coords</p>
        <p>
          <xsl:value-of select="concat($details/Latitude, ' ', $details/Longitude)"/>
        </p>
        <p class="u-bold u-padding-Txxs u-margin-Bxxs">Max LOA</p>
        <p>
          <xsl:apply-templates select="$details/Max_LOA"/>
        </p>
        <p class="u-bold u-padding-Txxs u-margin-Bxxs">Max Beam</p>
        <p>
          <xsl:apply-templates select="$details/Max_Beam"/>
        </p>
      </div>
    </div>
  </xsl:template>

  <xsl:template match="Maximum_Draft|Max_Beam|Max_LOA|Annual_TEU|Annual_No_Vessels|Annual_no_Pax|Annual_Tonnage|Maximum_Draft|Max_DWT">
    <xsl:param name="value" select="."/>
    <xsl:choose>
      <xsl:when test="$value = '0' or text() = ''">
        Unknown
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$value"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
</xsl:stylesheet>
