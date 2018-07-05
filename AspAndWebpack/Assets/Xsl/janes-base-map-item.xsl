<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:janes="http://dtd.janes.com/2002/Content/">

  <xsl:output omit-xml-declaration="yes" />

  <xsl:param name="stringLookups">
    <!-- PUT IN ALPHABETICAL ORDER PLEASE -->
    <string language="en" key="Annual_No_Vessels">Annual Number of Vessels</string>
    <string language="en" key="Annual_TEU">Annual TEU</string>
    <string language="en" key="Annual_Tonnage">Annual Tonnage</string>
    <string language="en" key="basename">Base Name</string>
    <string language="en" key="breakBulk">Break Bulk</string>
    <string language="en" key="confidence" tooltip="High - Location of base has been verified. &#10;Medium - We've verified that there is a base in the area, but the precise location is not known. &#10;Low - Unable to verify the location of the base, or even its existence. Credible reports/sources suggest one exists.">Location Confidence</string>
    <string language="en" key="container">Container</string>
    <string language="en" key="country">Country</string>
    <string language="en" key="countryiso">Country ISO</string>
    <string language="en" key="CSI_Compliant">CSI Compliant</string>
    <string language="en" key="database">Database</string>
    <string language="en" key="designcapacity_t_year">Design Capacity (t/year)</string>
    <string language="en" key="designcapacity_t hm">Design Capacity (t/HM)</string>
    <string language="en" key="designcapacity_mw">Design Capacity (MW)</string>
    <string language="en" key="dry_bulk">Dry Bulk</string>
    <string language="en" key="dry_dock">Dry Dock</string>
    <string language="en" key="endofoperation">End of Operation</string>
    <string language="en" key="facilitytype">Facility Type</string>
    <string language="en" key="familyname">Family Name</string>
    <string language="en" key="gas">Gas</string>
    <string language="en" key="iaeareferencenumber">IAEA Reference Number</string>
    <string language="en" key="iaeasafeguards">IAEA Safeguards</string>
    <string language="en" key="installationstatus">Installation Status</string>
    <string language="en" key="installationtype">Installation Type</string>
    <string language="en" key="ISPS_Compliant">ISPS Compliant</string>
    <string language="en" key="liquid">Liquid</string>
    <string language="en" key="locationcountryiso">Location Country</string>
    <string language="en" key="locationlevel">Location Level</string>
    <string language="en" key="associatedEquipments">Associated Equipment</string>
    <string language="en" key="Maximum_Draft">Maximum Draft</string>
    <string language="en" key="Max_Beam">Maximum Beam</string>
    <string language="en" key="Max_DWT">Maximum DWT</string>
    <string language="en" key="Max_LOA">Maximum LOA</string>
    <string language="en" key="mlFeatureTypes">Features</string>
    <string language="en" key="mlWorldPortNumber">Master Port Number</string>
    <string language="en" key="mlrunwayelevationfeet">Elevation (ft)</string>
    <string language="en" key="mlrunwayelevationmetres">Elevation (m)</string>
    <string language="en" key="mlrunwaylengthfeet">Length (ft)</string>
    <string language="en" key="mlrunwaylengthmetres">Length (m)</string>
    <string language="en" key="mlrunways">Runways</string>
    <string language="en" key="mlrunwaysurface">Surface</string>
    <string language="en" key="mlSystem">System</string>
    <string language="en" key="mlUNLCODE">UN/LOCODE</string>
    <string language="en" key="multi_purpose">Multi Purpose</string>
    <string language="en" key="natoname">Nato Name</string>
    <string language="en" key="numberofrunways">Number of Runways</string>
    <string language="en" key="operatorcountry">Operator Country</string>
    <string language="en" key="operatorcountryiso">Operator Country ISO</string>
    <string language="en" key="operatorregion">Operator Region</string>
    <string language="en" key="operatorservicetype">Operator Service Type</string>
    <string language="en" key="operatortype">Operator Type</string>
    <string language="en" key="operators">Operators</string>
    <string language="en" key="parentareaname">Parent Area Name</string>
    <string language="en" key="passenger">Passenger</string>
    <string language="en" key="publishednotes">Published Notes</string>
    <string language="en" key="referencepower_mw">Reference Power Unit</string>
    <string language="en" key="region">Region</string>
    <string language="en" key="roro">Roll On/Roll Off</string>
    <string language="en" key="runwayelevationfeet">Runway Elevation (ft)</string>
    <string language="en" key="runwayelevationmetres">Runway Elevation (m)</string>
    <string language="en" key="runwaylengthfeet">Runway Length (ft)</string>
    <string language="en" key="runwaylengthmetres">Runway Length (m)</string>
    <string language="en" key="runwaysurface">Runway Surface</string>
    <string language="en" key="scale">Scale</string>
    <string language="en" key="sitelayout">Site Layout</string>
    <string language="en" key="startofoperation">Start of Operation</string>
    <string language="en" key="subtype">Sub Type</string>
    <string language="en" key="support">Support</string>
    <string language="en" key="systemname">System Name</string>
    <string language="en" key="systempermanence">System Permanence</string>
    <string language="en" key="title">Title</string>
    <string language="en" key="type">Type</string>
    <string language="en" key="UNCTAD_Code">UNCTAD Code</string>
    <!-- PUT IN ALPHABETICAL ORDER PLEASE -->
  </xsl:param>

  <xsl:template match="*">
    <!-- DO NOT RENDER UN-SPECIFIED ELEMENTS -->
  </xsl:template>

  <xsl:template match="mlEnvelope">
    <xsl:element name="table">
      <xsl:attribute name="class">table</xsl:attribute>
      <xsl:element name="tbody">
        <xsl:apply-templates/>
      </xsl:element>
    </xsl:element>
  </xsl:template>

  <xsl:template match="mlMetaData">
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="content">
    <xsl:apply-templates select="installation" />
    <xsl:apply-templates select="installation/confidence"/>
    <xsl:apply-templates select="facilities"/>
  </xsl:template>

  <!-- NAMED TEMPLATES -->
  <xsl:template name="table_label">
    <xsl:param name="text" />
    <xsl:element name="td">
      <xsl:attribute name="title">
        <xsl:choose>
          <xsl:when test="$stringLookups/string[upper-case(@key)=upper-case($text) and @language='en']/@tooltip">
            <xsl:value-of select="$stringLookups/string[upper-case(@key)=upper-case($text) and @language='en']/@tooltip"/>
          </xsl:when>
        </xsl:choose>
      </xsl:attribute>
      <xsl:choose>
        <xsl:when test="$stringLookups/string[upper-case(@key)=upper-case($text) and @language='en']">
          <xsl:value-of select="$stringLookups/string[upper-case(@key)=upper-case($text) and @language='en']"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="$text"/>
        </xsl:otherwise>
      </xsl:choose>
      <xsl:text>:&#160;</xsl:text>
      <xsl:choose>
        <xsl:when test="$stringLookups/string[upper-case(@key)=upper-case($text) and @language='en']/@tooltip">
          <i class="icon-help-circled"></i>
        </xsl:when>
      </xsl:choose>
    </xsl:element>
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

  <!-- MATCH TEMPLATES -->
  <xsl:template match="mlTitle">
    <xsl:element name="tr">
      <xsl:call-template name="table_label">
        <xsl:with-param name="text" select="'Title'"/>
      </xsl:call-template>
      <xsl:element name="td">
        <xsl:apply-templates/>
      </xsl:element>
    </xsl:element>
  </xsl:template>

  <xsl:template match="content/installation/confidence">
    <xsl:element name="tr">
      <xsl:call-template name="table_label">
        <xsl:with-param name="text" select="'confidence'"/>
      </xsl:call-template>
      <xsl:element name="td">
        <xsl:apply-templates/>
      </xsl:element>
    </xsl:element>
  </xsl:template>

  <xsl:template match="mlSyns[matches(.,'[0-9a-z]','i')]">
    <xsl:element name="tr">
      <xsl:call-template name="table_label">
        <xsl:with-param name="text" select="'Synonyms'"/>
      </xsl:call-template>
      <xsl:element name="td">
        <xsl:apply-templates/>
      </xsl:element>
    </xsl:element>
  </xsl:template>

  <xsl:template match="mlParent">
    <xsl:element name="tr">
      <xsl:call-template name="table_label">
        <xsl:with-param name="text" select="'Parent'"/>
      </xsl:call-template>
      <xsl:element name="td">
        <xsl:apply-templates/>
      </xsl:element>
    </xsl:element>
  </xsl:template>

  <xsl:template match="mlSystem">
    <xsl:element name="tr">
      <xsl:call-template name="table_label">
        <xsl:with-param name="text" select="'System'"/>
      </xsl:call-template>
      <xsl:element name="td">
        <xsl:element name="a">
          <xsl:attribute name="href">
            <xsl:text>/equipment/explore/</xsl:text>
            <xsl:value-of select="equipmentId" />
          </xsl:attribute>
          <xsl:attribute name="target">
            <xsl:text>_blank</xsl:text>
          </xsl:attribute>
          <xsl:value-of select="equipmentName" />
        </xsl:element>
      </xsl:element>
    </xsl:element>
  </xsl:template>

  <!-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ NAVIGATORS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ -->

  <xsl:template match="mlNavs">
    <xsl:apply-templates select="mlNav[@name='country']"/>
    <xsl:apply-templates select="mlNav[@name='region']"/>
    <xsl:apply-templates select="mlNav[@name='type']"/>
    <xsl:apply-templates select="mlNav[@name='subtype']"/>
    <xsl:apply-templates select="mlNav[@name='installationsatus']"/>
    <xsl:apply-templates select="mlNav[@name='locationlevel']"/>
    <xsl:apply-templates select="mlNav[@name='facilitytype']"/>
    <xsl:apply-templates select="mlNav[@name='parentareaname']"/>
    <xsl:apply-templates select="mlNav[@name='startofoperation']"/>
    <xsl:apply-templates select="mlNav[@name='scale']"/>
    <xsl:apply-templates select="mlNav[@name='iaeasafeguards']"/>
    <xsl:apply-templates select="mlNav[@name='database']"/>
    <xsl:apply-templates select="mlNav[@name='designcapacity_mw']"/>
    <xsl:apply-templates select="mlNav[@name='referencepower_mw']"/>
    <xsl:apply-templates select="mlNav[@name='systempermanence']"/>
    <xsl:apply-templates select="mlNav[@name='familyname']"/>
    <xsl:apply-templates select="mlNav[@name='natoname']"/>
    <xsl:apply-templates select="mlNav[@name='sitelayout']"/>
    <xsl:apply-templates select="mlNav[@name='systemname']"/>
    <xsl:apply-templates select="mlNav[@name='operatorcountry']"/>
  </xsl:template>

  <xsl:template match="mlNav[@name='familyname']">
    <xsl:element name="tr">
      <xsl:call-template name="table_label">
        <xsl:with-param name="text" select="'Family'"/>
      </xsl:call-template>
      <xsl:element name="td">
        <xsl:choose>
          <xsl:when test="//mlSystem">
            <xsl:element name="a">
              <xsl:attribute name="href">
                <xsl:text>/equipment/explore/</xsl:text>
                <xsl:value-of select="//mlSystem/familyRootId" />
              </xsl:attribute>
              <xsl:attribute name="target">
                <xsl:text>_blank</xsl:text>
              </xsl:attribute>
              <xsl:apply-templates/>
            </xsl:element>
          </xsl:when>
          <xsl:otherwise>
            <xsl:apply-templates/>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:element>
    </xsl:element>
  </xsl:template>

  <xsl:template match="mlNav">
    <xsl:element name="tr">
      <xsl:call-template name="table_label">
        <xsl:with-param name="text" select="@name"/>
      </xsl:call-template>
      <xsl:element name="td">
        <xsl:apply-templates/>
      </xsl:element>
    </xsl:element>
  </xsl:template>


  <xsl:template match="mlNav/node">
    <xsl:element name="div">
      <xsl:apply-templates/>
    </xsl:element>
  </xsl:template>

  <!-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ EQUIPMENT ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ -->

  <xsl:template match="associatedEquipments">
    <xsl:if test="*">
      <xsl:element name="tr">
        <xsl:element name="td">
          <xsl:attribute name="colspan">2</xsl:attribute>
          <xsl:call-template name="label">
            <xsl:with-param name="text" select="local-name()"/>
          </xsl:call-template>
          <xsl:element name="table">
            <xsl:attribute name="class">table-bordered table-condensed</xsl:attribute>
            <xsl:element name="thead">
              <xsl:element name="tr">
                <xsl:element name="th">Type</xsl:element>
                <xsl:element name="th">Name</xsl:element>
                <xsl:element name="th">Count</xsl:element>
                <xsl:element name="th">
                  <xsl:text>Range (m)</xsl:text>
                  <!-- Checkbox for when the range rings are turned OFF for the whole layer -->
                  <xsl:element name="label">
                    <xsl:attribute name="class">toggleSwitch</xsl:attribute>
                    <xsl:attribute name="data-bind">visible:layerSettings.showRanges() === 'false' </xsl:attribute>
                    <xsl:element name="input">
                      <xsl:attribute name="type">checkbox</xsl:attribute>
                      <xsl:attribute name="data-bind">
                        checked:rangesSwitched.indexOf('<xsl:value-of select="/mlEnvelope/mlMetaData/mlUID" />') > -1, click:toggleRange.bind($data, '<xsl:value-of select="/mlEnvelope/mlMetaData/mlUID" />')
                      </xsl:attribute>
                      <xsl:attribute name="value">
                        <xsl:value-of select="/mlEnvelope/mlMetaData/mlUID" />
                      </xsl:attribute>
                      <xsl:element name="span">
                        <xsl:element name="span" />
                        <xsl:element name="span" />
                        <xsl:element name="a" />
                      </xsl:element>
                    </xsl:element>
                  </xsl:element>
                  <!-- Checkbox for when the range rings are turned ON for the whole layer -->
                  <xsl:element name="label">
                    <xsl:attribute name="class">toggleSwitch</xsl:attribute>
                    <xsl:attribute name="data-bind">visible:layerSettings.showRanges() === 'true' </xsl:attribute>
                    <xsl:element name="input">
                      <xsl:attribute name="type">checkbox</xsl:attribute>
                      <xsl:attribute name="data-bind">
                        checked:rangesSwitched.indexOf('<xsl:value-of select="/mlEnvelope/mlMetaData/mlUID" />') === -1, click:toggleRange.bind($data, '<xsl:value-of select="/mlEnvelope/mlMetaData/mlUID" />')
                      </xsl:attribute>
                      <xsl:attribute name="value">
                        <xsl:value-of select="/mlEnvelope/mlMetaData/mlUID" />
                      </xsl:attribute>
                      <xsl:element name="span">
                        <xsl:element name="span" />
                        <xsl:element name="span" />
                        <xsl:element name="a" />
                      </xsl:element>
                    </xsl:element>
                  </xsl:element>
                </xsl:element>
              </xsl:element>
            </xsl:element>
            <xsl:element name="tbody">
              <xsl:apply-templates/>
            </xsl:element>
          </xsl:element>
        </xsl:element>
      </xsl:element>
    </xsl:if>
  </xsl:template>

  <xsl:template match="associatedEquipments/associatedEquipment">
    <xsl:element name="tr">
      <xsl:element name="td">
        <xsl:apply-templates select="equipmentType" />
      </xsl:element>
      <xsl:element name="td">
        <xsl:element name="a">
          <xsl:attribute name="href">
            <xsl:text>javascript:void(0)</xsl:text>
          </xsl:attribute>
          <xsl:attribute name="data-bind">
            click : function(){ showDocument("<xsl:value-of select="equipmentName" />", "/equipment/getDocument?uid=<xsl:value-of select="equipmentId"/>&amp;providerName=JanesDocument&amp;categoryName=equip&amp;stylesheet=0") }
          </xsl:attribute>
          <xsl:apply-templates select="equipmentName" />
        </xsl:element>
      </xsl:element>
      <xsl:element name="td">
        <xsl:apply-templates select="numberOfItems" />
      </xsl:element>
      <xsl:element name="td">
        <xsl:apply-templates select="rangeInMeters" />
      </xsl:element>
    </xsl:element>
  </xsl:template>

  <xsl:template match="associatedEquipments/associatedEquipment/*">
    <xsl:apply-templates/>
  </xsl:template>

  <!-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ OPERATORS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ -->

  <xsl:template match="installation">
    <xsl:apply-templates select="operators" />
    <xsl:apply-templates select="associatedEquipments" />
    <xsl:apply-templates select="featureTypes" />
    <xsl:apply-templates select="runways" />
  </xsl:template>

  <xsl:template match="operators">
    <xsl:if test="*">
      <xsl:element name="tr">
        <xsl:element name="td">
          <xsl:call-template name="label">
            <xsl:with-param name="text" select="local-name()"/>
          </xsl:call-template>
        </xsl:element>
        <xsl:element name="td">
          <xsl:for-each select="operator">
            <xsl:value-of select="operatorServiceType"/>
            <xsl:text> (</xsl:text>
            <xsl:value-of select="operatorCountry"/>
            <xsl:text>)</xsl:text>
            <xsl:if test="position() != last()">
              <xsl:text>,</xsl:text>
            </xsl:if>
          </xsl:for-each>
        </xsl:element>
      </xsl:element>
    </xsl:if>
  </xsl:template>

  <!-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ FEATURES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ -->

  <xsl:template match="featureTypes">
    <xsl:if test="*">
      <xsl:element name="tr">
        <xsl:element name="td">
          <xsl:attribute name="colspan">2</xsl:attribute>
          <xsl:call-template name="label">
            <xsl:with-param name="text" select="local-name()"/>
          </xsl:call-template>
          <xsl:element name="table">
            <xsl:attribute name="class">table-bordered table-condensed</xsl:attribute>
            <xsl:element name="thead">
              <xsl:element name="tr">
                <xsl:element name="th">Name</xsl:element>
                <xsl:element name="th">Count</xsl:element>
              </xsl:element>
            </xsl:element>
            <xsl:element name="tbody">
              <xsl:apply-templates/>
            </xsl:element>
          </xsl:element>
        </xsl:element>
      </xsl:element>
    </xsl:if>
  </xsl:template>

  <xsl:template match="featureTypes/featureType">
    <xsl:element name="tr">
      <xsl:element name="td">
        <xsl:apply-templates select="feature" />
      </xsl:element>
      <xsl:element name="td">
        <xsl:apply-templates select="featureNumber" />
      </xsl:element>
    </xsl:element>
  </xsl:template>

  <xsl:template match="featureTypes/featureType/*">
    <xsl:apply-templates/>
  </xsl:template>

  <!-- ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ RUNWAYS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ -->

  <xsl:template match="runways">
    <xsl:if test="*">
      <xsl:element name="tr">
        <xsl:element name="td">
          <xsl:attribute name="colspan">2</xsl:attribute>
          <xsl:call-template name="label">
            <xsl:with-param name="text" select="local-name()"/>
          </xsl:call-template>
          <xsl:element name="table">
            <xsl:attribute name="class">table-bordered table-condensed</xsl:attribute>
            <xsl:element name="thead">
              <xsl:element name="tr">
                <xsl:element name="th">Length (m)</xsl:element>
                <xsl:element name="th">Elevation (ft)</xsl:element>
                <xsl:element name="th">Surface</xsl:element>
              </xsl:element>
            </xsl:element>
            <xsl:element name="tbody">
              <xsl:apply-templates/>
            </xsl:element>
          </xsl:element>
        </xsl:element>
      </xsl:element>
    </xsl:if>
  </xsl:template>

  <xsl:template match="runways/runway">
    <xsl:element name="tr">
      <xsl:element name="td">
        <xsl:apply-templates select="runwayLengthMetres" />
      </xsl:element>
      <xsl:element name="td">
        <xsl:apply-templates select="runwayElevationFeet" />
      </xsl:element>
      <xsl:element name="td">
        <xsl:apply-templates select="runwaySurface" />
      </xsl:element>
    </xsl:element>
  </xsl:template>

  <xsl:template match="runways/runway/*">
    <xsl:apply-templates/>
  </xsl:template>

  <!-- PORTS -->
  <xsl:template match="facilities">
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="mlUNLCODE|mlWorldPortNumber">
    <xsl:variable name="value" select="."/>
    <xsl:element name="tr">
      <xsl:call-template name="table_label">
        <xsl:with-param name="text" select="local-name()"/>
      </xsl:call-template>
      <xsl:element name="td">
        <xsl:value-of select="$value" disable-output-escaping="yes"/>
      </xsl:element>
    </xsl:element>
  </xsl:template>
  <xsl:template match="breakBulk|container|dry_bulk|liquid|gas|roro|passenger|multi_purpose|dry_dock|ISPS_Compliant|CSI_Compliant|Time_Zone">
    <xsl:variable name="value" select="."/>
    <xsl:element name="tr">
      <xsl:call-template name="table_label">
        <xsl:with-param name="text" select="local-name()"/>
      </xsl:call-template>
      <xsl:element name="td">
        <xsl:choose>
          <xsl:when test="$value = 1">
            <xsl:text>Yes</xsl:text>
          </xsl:when>
          <xsl:otherwise>
            <xsl:text>No</xsl:text>
          </xsl:otherwise>
        </xsl:choose>
      </xsl:element>
    </xsl:element>
  </xsl:template>

  <xsl:template match="Details">
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="Status|UNCTAD_Code|Maximum_Draft|Annual_Tonnage|Annual_TEU|Annual_No_Vessels|Maximum_Draft|Max_LOA|Max_Beam|Max_DWT|Latitude|Longitude">
    <xsl:variable name="value" select="."/>
    <xsl:element name="tr">
      <xsl:call-template name="table_label">
        <xsl:with-param name="text" select="local-name()"/>
      </xsl:call-template>
      <xsl:element name="td">
        <xsl:value-of select="$value" disable-output-escaping="yes"/>
      </xsl:element>
    </xsl:element>
  </xsl:template>

  <xsl:template match="mlUID">
    <xsl:variable name="value" select="."/>
    <!-- Current only rendering this for Ports -->
    <xsl:if test="starts-with($value, 'Port_')">
      <xsl:element name="tr">
        <xsl:call-template name="table_label">
          <xsl:with-param name="text" select='"Full Document"'/>
        </xsl:call-template>
        <xsl:element name="td">
          <xsl:element name="a">
            <xsl:attribute name="target">_blank</xsl:attribute>
            <xsl:attribute name="href">
              <xsl:value-of select="concat('/MaritimePorts/Display/', $value)"/>
            </xsl:attribute>
            <xsl:text>View Full Port Document</xsl:text>
            <i class="icon-link-ext"></i>
          </xsl:element>
        </xsl:element>
      </xsl:element>
    </xsl:if>
  </xsl:template>

</xsl:stylesheet>

