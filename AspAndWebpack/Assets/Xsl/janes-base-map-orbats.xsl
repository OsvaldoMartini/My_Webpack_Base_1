<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:janes="http://dtd.janes.com/2002/Content/">

  <xsl:output omit-xml-declaration="yes" />

  <xsl:template match="*">
    <!-- DO NOT RENDER UN-SPECIFIED ELEMENTS -->
  </xsl:template>

  <!-- NAMED TEMPLATES -->
  <xsl:template name="noData">
    <xsl:element name="div">
      <xsl:attribute name="class">
        <xsl:text>alert alert-info u-margin-As</xsl:text>
      </xsl:attribute>
      <xsl:text>We do not currently hold information for this.</xsl:text>
    </xsl:element>
  </xsl:template>

  <xsl:template name="th">
    <xsl:param name="text" />
    <xsl:param name="width" select="auto" />
    <xsl:element name="th">
  
      <xsl:attribute name="style">
        min-width:<xsl:value-of select="$width"/>
      </xsl:attribute>
      <xsl:value-of select="$text"/>
    </xsl:element>
  </xsl:template>

  <xsl:template name="td">
    <xsl:element name="td">
      <xsl:attribute name="class">
        <xsl:text>u-padding-Axxs</xsl:text>
      </xsl:attribute>
      <xsl:apply-templates />
    </xsl:element>
  </xsl:template>

  <!-- MATCHED TEMPLATES -->

  <xsl:template match="mlEnvelope">
    <xsl:choose>
      <xsl:when test="content">
        <xsl:element name="table">
          <xsl:attribute name="class">
            <xsl:text>table</xsl:text>
          </xsl:attribute>
          <xsl:element name="thead">
            <xsl:element name="tr">
              <xsl:call-template name="th">
                <xsl:with-param name="text" select="'Unit name'" />
                <xsl:with-param name="width" select="'150px'" />
              </xsl:call-template>
              <xsl:call-template name="th">
                <xsl:with-param name="text" select="'Echelon'" />
                <xsl:with-param name="width" select="'100px'" />
              </xsl:call-template>
              <xsl:call-template name="th">
                <xsl:with-param name="text" select="'Equipment'" />
                <xsl:with-param name="width" select="'150px'" />
              </xsl:call-template>
              <xsl:call-template name="th">
                <xsl:with-param name="text" select="'Parent unit name'" />
                <xsl:with-param name="width" select="'150px'" />
              </xsl:call-template>
              <xsl:call-template name="th">
                <xsl:with-param name="text" select="'Country of Sovereignty'" />
              </xsl:call-template>
              <xsl:call-template name="th">
                <xsl:with-param name="text" select="'Branch'" />
              </xsl:call-template>
              <xsl:call-template name="th">
                <xsl:with-param name="text" select="'Unit type'" />
                <xsl:with-param name="width" select="'100px'" />
              </xsl:call-template>
              <xsl:call-template name="th">
                <xsl:with-param name="text" select="'Unit role'" />
                <xsl:with-param name="width" select="'100px'" />
              </xsl:call-template>
            </xsl:element>
          </xsl:element>
          <xsl:element name="tbody">
        <xsl:apply-templates>
          <xsl:sort select="displayName" order="ascending"/>
        </xsl:apply-templates>
          </xsl:element>
        </xsl:element>            
      </xsl:when>
      <xsl:otherwise>
        <xsl:call-template name="noData"></xsl:call-template>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="content|orbat|Orbat">
    <xsl:choose>
    <xsl:when test="Orbat or orbat">
        <xsl:apply-templates select="orbat|orbat">
          <xsl:sort select="displayName" order="ascending"/>
        </xsl:apply-templates>
    </xsl:when>
    <xsl:otherwise>
    <xsl:element name="tr">
      <!-- DISPLAY NAME -->
      <xsl:choose>
        <xsl:when test="displayName">
          <xsl:apply-templates select="displayName" mode="makeLink"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:element name="td" />
        </xsl:otherwise>
      </xsl:choose>

      <!-- ECHELON -->
      <xsl:choose>
        <xsl:when test="echelon">
          <xsl:apply-templates select="echelon"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:element name="td" />
        </xsl:otherwise>
      </xsl:choose>

      <!-- EQUIPMENT -->
      <xsl:choose>
        <xsl:when test="associatedEquipments">
          <xsl:apply-templates select="associatedEquipments"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:element name="td" />
        </xsl:otherwise>
      </xsl:choose>

      <!-- PRIMARY PARENT -->
      <xsl:choose>
        <xsl:when test="primaryParent">
          <xsl:apply-templates select="primaryParent"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:element name="td" />
        </xsl:otherwise>
      </xsl:choose>

      <!-- SUB TYPE-->
      <xsl:choose>
        <xsl:when test="unitCountry">
          <xsl:apply-templates select="unitCountry"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:element name="td" />
        </xsl:otherwise>
      </xsl:choose>

      <!-- SUB TYPE-->
      <xsl:choose>
        <xsl:when test="branch">
          <xsl:apply-templates select="branch"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:element name="td" />
        </xsl:otherwise>
      </xsl:choose>
      
      <!-- PRIMARY TYPE (GENERAL)-->
      <xsl:choose>
        <xsl:when test="unitType">
          <xsl:apply-templates select="unitType"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:element name="td" />
        </xsl:otherwise>
      </xsl:choose>

      <!-- PRIMARY TYPE (SPECIFIC)-->
      <xsl:choose>
        <xsl:when test="unitRole">
          <xsl:apply-templates select="unitRole"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:element name="td" />
        </xsl:otherwise>
      </xsl:choose>
    </xsl:element>
    </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="content/*[not(local-name() = 'orbat')][not(local-name() = 'Orbat')]|orbat/*|Orbat/*">
    <xsl:call-template name="td" />
  </xsl:template>

  <xsl:template match="displayName" mode="makeLink">
    <xsl:element name="td">
      <xsl:element name="a">
        <xsl:attribute name="target">_blank</xsl:attribute>
        <xsl:attribute name="href">
          <xsl:text>/orbat/explore/</xsl:text>
          <xsl:value-of select="../orbatId"/>
        </xsl:attribute>
        <xsl:value-of select="."/>
        <xsl:element name="i">
          <xsl:attribute name="class">icon-link-ext u-margin-Lxs grey2</xsl:attribute>
        </xsl:element>
      </xsl:element>
    </xsl:element>
  </xsl:template>
  
  <xsl:template match="associatedEquipments">
    <xsl:element name="td">
      <xsl:apply-templates/>
    </xsl:element>
  </xsl:template>

  <xsl:template match="associatedEquipments/associatedEquipment">
    <xsl:element name="div">
      <xsl:attribute name="class">
        <xsl:text>u-margin-Bxxs</xsl:text>
      </xsl:attribute>
      <xsl:element name="a">
        <xsl:attribute name="href">
          <xsl:text>javascript:void(0)</xsl:text>
        </xsl:attribute>
          <xsl:attribute name="data-bind">
            click : function(){ showDocument('<xsl:value-of select="equipmentName" />', '/equipment/getDocument?uid=<xsl:value-of select="equipmentId"/>&amp;stylesheet=Equipment') }
          </xsl:attribute>
        <xsl:value-of select="equipmentName" />
      </xsl:element>
      <xsl:element name="span">
        <xsl:attribute name="class">
          <xsl:text>badge u-margin-Hxxs</xsl:text>
        </xsl:attribute>
        <xsl:apply-templates select="numberOfItems" />
      </xsl:element>
    </xsl:element>
  </xsl:template>

  <xsl:template match="associatedEquipments/associatedEquipment/*">
    <xsl:apply-templates/>
  </xsl:template>

</xsl:stylesheet>
